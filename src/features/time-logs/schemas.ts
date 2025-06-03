import { z } from 'zod';

/**
 * Schema for creating a time log entry
 */
export const CreateTimeLogSchema = z.object({
  minutes: z
    .number()
    .min(1)
    .describe('The number of minutes spent on the work item'),
  date: z.string().describe('The date of the time log in YYYY-MM-DD format'),
  workItemId: z
    .number()
    .describe('The ID of the work item the time is logged against'),
  type: z
    .enum([
      'Administration',
      'Analysis',
      'Deployment',
      'Design',
      'Development - Production Support',
      'Development - Project',
      'Documentation',
      'Leave - Annual',
      'Leave - Other',
      'Leave - Sick',
      'Lost Time',
      'Meeting',
      'Planning',
      'Public Holiday',
      'Research',
      'Routine Support',
      'Self Training',
      'Testing',
      'Time Off',
      'Training',
      'Troubleshooting',
      'User Support',
    ])
    .describe(
      'The type of work performed (e.g., "Development", "Testing", "Deployment")',
    ),
  comment: z
    .string()
    .describe('A comment or description of the work performed'),
});

/**
 * Schema for reading time log entries
 */
export const ReadTimeLogSchema = z.object({
  dateFrom: z
    .string()
    .optional()
    .describe('Start date for filtering time logs in YYYY-MM-DD format'),
  dateTo: z
    .string()
    .optional()
    .describe('End date for filtering time logs in YYYY-MM-DD format'),
  dateWeek: z
    .string()
    .optional()
    .describe(
      'Filter time logs by a specific ISO week in YYYY-Www format (e.g., 2025-W22)',
    ),
  workItemIds: z
    .array(z.number())
    .optional()
    .describe('Array of work item IDs to filter time logs by'),
});
