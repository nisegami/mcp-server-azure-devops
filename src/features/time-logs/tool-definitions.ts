import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolDefinition } from '../../shared/types/tool-definition';
import { CreateTimeLogSchema } from './schemas';

/**
 * List of time logs tools
 */
export const timeLogsTools: ToolDefinition[] = [
  {
    name: 'create_time_log',
    description: 'Create a new time log entry for a work item',
    inputSchema: zodToJsonSchema(CreateTimeLogSchema),
  },
];
