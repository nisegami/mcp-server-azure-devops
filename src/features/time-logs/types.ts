/**
 * Options for creating a time log entry
 */
export interface CreateTimeLogOptions {
  minutes: number;
  date: string;
  workItemId: number;
  type: string;
  comment: string;
}

/**
 * Options for reading time log entries
 */
export interface ReadTimeLogOptions {
  dateFrom?: string;
  dateTo?: string;
  dateWeek?: string;
  workItemIds?: number[];
}

/**
 * Time log entry response
 */
export interface TimeLogEntry {
  id: string;
  minutes: number;
  user: string;
  userId: string;
  date: string;
  dateWeek: string;
  workItemId: number;
  type: string;
  comment: string;
}

/**
 * API response from time logs endpoint
 */
export interface TimeLogApiResponse {
  count: number;
  value: TimeLogEntry[];
}
