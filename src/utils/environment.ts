// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Utility functions and constants related to environment variables.
 */

/**
 * Extract organization name from Azure DevOps organization URL
 */
export function getOrgNameFromUrl(url?: string): string {
  if (!url) return 'unknown-organization';
  const devMatch = url.match(/https?:\/\/dev\.azure\.com\/([^/]+)/);
  if (devMatch) {
    return devMatch[1];
  }
  const fallbackMatch = url.match(/https?:\/\/[^/]+\/([^/]+)/);
  return fallbackMatch ? fallbackMatch[1].replace('%20', ' ') : 'unknown-organization';
}

/**
 * Default project name from environment variables
 */
export const defaultProject =
  process.env.AZURE_DEVOPS_DEFAULT_PROJECT || 'no default project';

/**
 * Default organization name derived from the organization URL
 */
export const defaultOrg = getOrgNameFromUrl(process.env.AZURE_DEVOPS_ORG_URL);
