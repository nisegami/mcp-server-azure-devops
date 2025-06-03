import axios from 'axios';
import { getAuthorizationHeader } from '../../../shared/auth';
import {
  AzureDevOpsAuthenticationError,
  AzureDevOpsError,
} from '../../../shared/errors';
import { UserProfile } from '../types';

/**
 * Get details of the currently authenticated user
 *
 * This function returns basic profile information about the authenticated user.
 *
 * @returns User profile information including id, displayName, and email
 * @throws {AzureDevOpsError} If retrieval of user information fails
 */
export async function getMe(): Promise<UserProfile> {
  try {
    const url = `${process.env.AZURE_DEVOPS_ORG_URL}/_apis/identities?searchFilter=AccountName&filterValue=${process.env.AZURE_DEVOPS_USERNAME}&api-version=6.0`;
    // Get the authorization header
    const authHeader = await getAuthorizationHeader();
    // Make direct call to the Profile API endpoint
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const profile = response.data;

    // Extract user data from the response
    const userData = profile.value?.[0];

    if (!userData) {
      throw new AzureDevOpsError('No user data found in response');
    }

    // Return the user profile with required fields
    return {
      id: userData.id || '',
      displayName: userData.providerDisplayName || '',
      email: userData.properties?.Mail?.$value || '',
    };
  } catch (error) {
    // Handle authentication errors
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      throw new AzureDevOpsAuthenticationError(
        `Authentication failed: ${error.message}`,
      );
    }

    // If it's already an AzureDevOpsError, rethrow it
    if (error instanceof AzureDevOpsError) {
      throw error;
    }

    // Otherwise, wrap it in a generic error
    throw new AzureDevOpsError(
      `Failed to get user information: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
