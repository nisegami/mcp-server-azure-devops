import { WebApi } from 'azure-devops-node-api';
import { ReadTimeLogOptions, TimeLogEntry, TimeLogApiResponse } from '../types';
import axios from 'axios';
import { getMe } from '../../users';
import { getAuthorizationHeader } from '../../../shared/auth';
import { AzureDevOpsError } from '../../../shared/errors';

/**
 * Read time log entries with optional filtering
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for filtering time log entries
 * @returns Array of time log entries
 */
export async function readTimeLogs(
  _connection: WebApi,
  options: ReadTimeLogOptions = {},
): Promise<TimeLogEntry[]> {
  try {
    // Construct the URL for the time log API using the baseUrl from environment
    const url = `${process.env.AZURE_DEVOPS_ORG_URL}/_apis/ExtensionManagement/InstalledExtensions/timelog/time-logging-extension/Data/Scopes/Default/Current/Collections/TimeLogData/Documents`;

    console.error(
      '[TimeLog] Reading time log entries with options:',
      JSON.stringify(options, null, 2),
    );

    // Get the authorization header
    const authHeader = await getAuthorizationHeader();

    // Make the API request
    const response = await axios.get<TimeLogApiResponse>(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json;api-version=3.1-preview.1;excludeUrls=true',
        'Content-Type': 'application/json',
      },
    });

    // Check if the request was successful
    if (response.status !== 200) {
      throw new Error(
        `Failed to read time log entries: ${response.statusText}`,
      );
    }

    console.error(
      `[TimeLog] Retrieved ${response.data.count} total time log entries`,
    );

    let filteredEntries = response.data.value;

    // Filter by current user by default
    const { id: currentUserId } = await getMe();
    if (currentUserId) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.userId === currentUserId,
      );
      console.error(
        `[TimeLog] Filtered to ${filteredEntries.length} entries for current user`,
      );
    }

    // Apply date range filter if provided
    if (options.dateFrom || options.dateTo) {
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = entry.date;

        if (options.dateFrom && entryDate < options.dateFrom) {
          return false;
        }

        if (options.dateTo && entryDate > options.dateTo) {
          return false;
        }

        return true;
      });
      console.error(
        `[TimeLog] After date filtering: ${filteredEntries.length} entries`,
      );
    }

    // Apply date week filter if provided
    if (options.dateWeek) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.dateWeek === options.dateWeek,
      );
      console.error(
        `[TimeLog] After date week filtering: ${filteredEntries.length} entries`,
      );
    }

    // Apply work item ID filter if provided
    if (options.workItemIds && options.workItemIds.length > 0) {
      filteredEntries = filteredEntries.filter((entry) =>
        options.workItemIds!.includes(entry.workItemId),
      );
      console.error(
        `[TimeLog] After work item filtering: ${filteredEntries.length} entries`,
      );
    }

    // Sort by date (most recent first)
    filteredEntries.sort((a, b) => b.date.localeCompare(a.date));

    console.error(
      `[TimeLog] Returning ${filteredEntries.length} filtered time log entries`,
    );

    return filteredEntries;
  } catch (error) {
    console.error('[TimeLog] Error reading time log entries:', error);
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to read time log entries: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
