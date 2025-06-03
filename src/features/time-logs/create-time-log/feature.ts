import { WebApi } from 'azure-devops-node-api';
import { CreateTimeLogOptions, TimeLogEntry } from '../types';
import axios from 'axios';
import { getMe } from '../../users';
import { getAuthorizationHeader } from '../../../shared/auth';
import { AzureDevOpsError } from '../../../shared/errors';

/**
 * Calculate ISO week number from a date string (YYYY-MM-DD)
 * @param dateString Date string in YYYY-MM-DD format
 * @returns ISO week string in YYYY-Www format
 */
function getISOWeek(dateString: string): string {
  const date = new Date(dateString);

  // Create a new date object for the same date
  const target = new Date(date.valueOf());

  // ISO week date weeks start on Monday, so correct the day number
  const dayNr = (date.getDay() + 6) % 7;

  // Set the target to the first day of the week (Monday)
  target.setDate(target.getDate() - dayNr + 3);

  // Get the first Thursday of the year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);

  // The week number is the number of weeks between the first Thursday and the target date
  const weekNr =
    1 + Math.ceil((target.getTime() - firstThursday.getTime()) / 604800000);

  // Format as YYYY-Www
  return `${date.getFullYear()}-W${weekNr.toString().padStart(2, '0')}`;
}

/**
 * Create a time log entry
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for creating the time log entry
 * @returns The created time log entry
 */
export async function createTimeLog(
  _connection: WebApi,
  options: CreateTimeLogOptions,
): Promise<TimeLogEntry> {
  try {
    // Validate required fields
    if (!options.minutes || options.minutes < 1) {
      throw new Error('Minutes must be a positive number');
    }
    if (!options.date) {
      throw new Error('Date is required');
    }
    if (!options.workItemId) {
      throw new Error('Work item ID is required');
    }
    if (!options.type) {
      throw new Error('Type is required');
    }
    if (!options.comment) {
      throw new Error('Comment is required');
    }

    // Calculate the dateWeek based on the date provided
    const dateWeek = getISOWeek(options.date);

    // Construct the URL for the time log API using the baseUrl from environment
    const url = `${process.env.AZURE_DEVOPS_ORG_URL}/_apis/ExtensionManagement/InstalledExtensions/timelog/time-logging-extension/Data/Scopes/Default/Current/Collections/TimeLogData/Documents`;

    const userName = process.env.AZURE_DEVOPS_USERNAME;
    const { id, displayName } = await getMe();

    // Create the request payload
    const payload = {
      minutes: options.minutes,
      user: displayName || userName || 'Unknown User',
      userId: id || 'Unknown User ID',
      date: options.date,
      dateWeek: dateWeek,
      workItemId: options.workItemId,
      type: options.type,
      comment: options.comment,
    };

    console.error(
      '[TimeLog] Creating time log entry:',
      JSON.stringify(payload, null, 2),
    );

    // Get the authorization header
    const authHeader = await getAuthorizationHeader();

    // Make the API request
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json;api-version=3.1-preview.1;excludeUrls=true',
        'Content-Type': 'application/json',
      },
    });

    // Check if the request was successful
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        `Failed to create time log entry: ${response.statusText}`,
      );
    }

    // Return the created time log entry
    return {
      id: response.data.id || 'unknown',
      ...payload,
    };
  } catch (error) {
    console.error('[TimeLog] Error creating time log entry:', error);
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to create time log entry: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
