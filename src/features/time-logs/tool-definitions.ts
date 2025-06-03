import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from '../../shared/types/tool-definition';
import { CreateTimeLogSchema, ReadTimeLogSchema } from './schemas';

/**
 * List of time logs tools
 */
export const timeLogsTools: ToolDefinition[] = [
  {
    name: 'create_time_log',
    description: 'Create a new time log entry for a work item',
    inputSchema: zodToJsonSchema(CreateTimeLogSchema),
  },
  {
    name: 'read_time_logs',
    description:
      "Read time log entries with optional filtering by date range and work item IDs. By default, filters to show only the current user's time logs.",
    inputSchema: zodToJsonSchema(ReadTimeLogSchema),
  },
];
