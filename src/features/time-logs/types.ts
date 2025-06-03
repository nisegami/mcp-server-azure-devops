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
