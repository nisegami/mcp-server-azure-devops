// Re-export schemas and types
export * from './schemas';
export * from './types';

// Re-export features
export * from './create-time-log';
export * from './read-time-logs';

// Export tool definitions
export * from './tool-definitions';

// New exports for request handling
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { WebApi } from 'azure-devops-node-api';
import {
  RequestIdentifier,
  RequestHandler,
} from '../../shared/types/request-handler';
import {
  CreateTimeLogSchema,
  ReadTimeLogSchema,
  createTimeLog,
  readTimeLogs,
} from './';

/**
 * Checks if the request is for the time logs feature
 */
export const isTimeLogsRequest: RequestIdentifier = (
  request: CallToolRequest,
): boolean => {
  const toolName = request.params.name;
  return ['create_time_log', 'read_time_logs'].includes(toolName);
};

/**
 * Handles time logs feature requests
 */
export const handleTimeLogsRequest: RequestHandler = async (
  connection: WebApi,
  request: CallToolRequest,
): Promise<{ content: Array<{ type: string; text: string }> }> => {
  switch (request.params.name) {
    case 'create_time_log': {
      const args = CreateTimeLogSchema.parse(request.params.arguments);
      const result = await createTimeLog(connection, {
        minutes: args.minutes,
        date: args.date,
        workItemId: args.workItemId,
        type: args.type,
        comment: args.comment,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'read_time_logs': {
      const args = ReadTimeLogSchema.parse(request.params.arguments);
      const result = await readTimeLogs(connection, {
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
        dateWeek: args.dateWeek,
        workItemIds: args.workItemIds,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown time logs tool: ${request.params.name}`);
  }
};
