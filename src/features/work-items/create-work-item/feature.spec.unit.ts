import { createWorkItem } from './feature';
import { AzureDevOpsError } from '../../../shared/errors';

// Unit tests should only focus on isolated logic
// No real connections, HTTP requests, or dependencies
describe('createWorkItem unit', () => {
  // Test for required title validation
  test('should throw error when title is not provided', async () => {
    // Arrange - mock connection, never used due to validation error
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn(),
    };

    // Act & Assert
    await expect(
      createWorkItem(
        mockConnection,
        'TestProject',
        'Task',
        { title: '' }, // Empty title
      ),
    ).rejects.toThrow('Title is required');
  });

  // Test for error propagation
  test('should propagate custom errors when thrown internally', async () => {
    // Arrange
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Custom error');
      }),
    };

    // Act & Assert
    await expect(
      createWorkItem(mockConnection, 'TestProject', 'Task', {
        title: 'Test Task',
      }),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      createWorkItem(mockConnection, 'TestProject', 'Task', {
        title: 'Test Task',
      }),
    ).rejects.toThrow('Custom error');
  });

  test('should wrap unexpected errors in a friendly error message', async () => {
    // Arrange
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    // Act & Assert
    await expect(
      createWorkItem(mockConnection, 'TestProject', 'Task', {
        title: 'Test Task',
      }),
    ).rejects.toThrow('Failed to create work item: Unexpected error');
  });

  // Test for originalEstimate field handling
  test('should include originalEstimate field when provided', async () => {
    // Arrange
    const mockCreateWorkItem = jest.fn().mockResolvedValue({
      id: 123,
      fields: {
        'System.Title': 'Test Task',
        'Microsoft.VSTS.Scheduling.OriginalEstimate': 8,
      },
    });

    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue({
        createWorkItem: mockCreateWorkItem,
      }),
      serverUrl: 'https://dev.azure.com/test',
    };

    // Act
    await createWorkItem(mockConnection, 'TestProject', 'Task', {
      title: 'Test Task',
      originalEstimate: 8,
    });

    // Assert
    expect(mockCreateWorkItem).toHaveBeenCalledWith(
      null,
      expect.arrayContaining([
        {
          op: 'add',
          path: '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate',
          value: 8,
        },
      ]),
      'TestProject',
      'Task',
    );
  });

  test('should not include originalEstimate field when not provided', async () => {
    // Arrange
    const mockCreateWorkItem = jest.fn().mockResolvedValue({
      id: 123,
      fields: {
        'System.Title': 'Test Task',
      },
    });

    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue({
        createWorkItem: mockCreateWorkItem,
      }),
      serverUrl: 'https://dev.azure.com/test',
    };

    // Act
    await createWorkItem(mockConnection, 'TestProject', 'Task', {
      title: 'Test Task',
    });

    // Assert
    const callArgs = mockCreateWorkItem.mock.calls[0][1];
    const originalEstimateField = callArgs.find(
      (field: any) =>
        field.path === '/fields/Microsoft.VSTS.Scheduling.OriginalEstimate',
    );
    expect(originalEstimateField).toBeUndefined();
  });
});
