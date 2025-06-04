import { WebApi } from 'azure-devops-node-api';
import { TeamContext } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import {
  WorkItem,
  WorkItemReference,
} from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import {
  AzureDevOpsError,
  AzureDevOpsAuthenticationError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';
import { ListWorkItemsOptions, WorkItem as WorkItemType } from '../types';

/**
 * Constructs the default WIQL query for listing work items
 */
function constructDefaultWiql(projectName: string, teamId?: string): string {
  let query = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${projectName}'`;
  if (teamId) {
    query += ` AND [System.TeamId] = '${teamId}'`;
  }
  query += ' ORDER BY [System.Id]';
  return query;
}

/**
 * Modifies a WIQL query to ensure it's scoped to the specified project
 */
function ensureProjectScope(wiql: string, projectName: string): string {
  // Check if the query already contains a project constraint
  const hasProjectConstraint = /\[System\.TeamProject\]\s*=/.test(wiql);

  if (hasProjectConstraint) {
    // Query already has project constraint, return as-is
    return wiql;
  }

  // First, extract and remove ORDER BY and GROUP BY clauses to avoid parsing conflicts
  let workingQuery = wiql;
  let extractedClauses = '';

  // Extract ORDER BY clause (must come after GROUP BY if both exist)
  const orderByMatch = workingQuery.match(/\s+ORDER\s+BY\s+.+$/i);
  if (orderByMatch) {
    extractedClauses = orderByMatch[0] + extractedClauses;
    workingQuery = workingQuery.substring(0, orderByMatch.index!);
  }

  // Extract GROUP BY clause
  const groupByMatch = workingQuery.match(/\s+GROUP\s+BY\s+[^ORDER]+/i);
  if (groupByMatch) {
    extractedClauses = groupByMatch[0] + extractedClauses;
    workingQuery = workingQuery.substring(0, groupByMatch.index!);
  }

  // Now process the WHERE clause on the cleaned query
  const whereMatch = workingQuery.match(/\bWHERE\b/i);

  let result: string;
  if (whereMatch) {
    // Add project constraint to existing WHERE clause
    const whereIndex = whereMatch.index! + whereMatch[0].length;
    const beforeWhere = workingQuery.substring(0, whereIndex);
    const afterWhere = workingQuery.substring(whereIndex);
    result = `${beforeWhere} [System.TeamProject] = '${projectName}' AND (${afterWhere.trim()})`;
  } else {
    // Add WHERE clause with project constraint
    const trimmedQuery = workingQuery.trim();
    result = `${trimmedQuery} WHERE [System.TeamProject] = '${projectName}'`;
  }

  // Append the extracted clauses back
  result += extractedClauses;

  process.stderr.write(`Modified WIQL to ensure project scope: ${result}`);
  return result;
}

/**
 * List work items in a project
 *
 * @param connection The Azure DevOps WebApi connection
 * @param options Options for listing work items
 * @returns List of work items
 */
export async function listWorkItems(
  connection: WebApi,
  options: ListWorkItemsOptions,
): Promise<WorkItemType[]> {
  try {
    const witApi = await connection.getWorkItemTrackingApi();
    const { projectName, teamId, queryId, wiql } = options;

    let workItemRefs: WorkItemReference[] = [];

    if (queryId) {
      const teamContext: TeamContext = {
        project: projectName,
        team: teamId,
      };
      const queryResult = await witApi.queryById(queryId, teamContext);
      workItemRefs = queryResult.workItems || [];
    } else {
      let query: string;
      if (wiql) {
        // Ensure the provided WIQL query is scoped to the specified project
        query = ensureProjectScope(wiql, projectName);
      } else {
        // Use the default query
        query = constructDefaultWiql(projectName, teamId);
      }

      const teamContext: TeamContext = {
        project: projectName,
        team: teamId,
      };
      const queryResult = await witApi.queryByWiql({ query }, teamContext);
      workItemRefs = queryResult.workItems || [];
    }

    // Apply pagination in memory
    const { top = 200, skip } = options;
    if (skip !== undefined) {
      workItemRefs = workItemRefs.slice(skip);
    }
    if (top !== undefined) {
      workItemRefs = workItemRefs.slice(0, top);
    }

    const workItemIds = workItemRefs
      .map((ref) => ref.id)
      .filter((id): id is number => id !== undefined);

    if (workItemIds.length === 0) {
      return [];
    }

    const fields = [
      'System.Id',
      'System.Title',
      'System.State',
      'System.AssignedTo',
    ];
    const workItems = await witApi.getWorkItems(
      workItemIds,
      fields,
      undefined,
      undefined,
    );

    if (!workItems) {
      return [];
    }

    return workItems.filter((wi): wi is WorkItem => wi !== undefined);
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }

    // Check for specific error types and convert to appropriate Azure DevOps errors
    if (error instanceof Error) {
      if (
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized')
      ) {
        throw new AzureDevOpsAuthenticationError(
          `Failed to authenticate: ${error.message}`,
        );
      }

      if (
        error.message.includes('not found') ||
        error.message.includes('does not exist')
      ) {
        throw new AzureDevOpsResourceNotFoundError(
          `Resource not found: ${error.message}`,
        );
      }
    }

    throw new AzureDevOpsError(
      `Failed to list work items: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
