# Authentication Guide for Azure DevOps MCP Server

This guide provides detailed information about the authentication methods supported by the Azure DevOps MCP Server, including setup instructions, configuration examples, and troubleshooting tips.

## Supported Authentication Methods

The Azure DevOps MCP Server supports three authentication methods:

1. **Personal Access Token (PAT)** - Simple token-based authentication
2. **Azure Identity (DefaultAzureCredential)** - Flexible authentication using the Azure Identity SDK
3. **Azure CLI** - Authentication using your Azure CLI login

## Method 1: Personal Access Token (PAT) Authentication

PAT authentication is the simplest method and works well for personal use or testing.

### Setup Instructions

1. **Generate a PAT in Azure DevOps**:

   - Go to https://dev.azure.com/{your-organization}/_usersSettings/tokens
   - Or click on your profile picture > Personal access tokens
   - Select "+ New Token"
   - Name your token (e.g., "MCP Server Access")
   - Set an expiration date
   - Select the following scopes:
     - **Code**: Read & Write
     - **Work Items**: Read & Write
     - **Build**: Read & Execute
     - **Project and Team**: Read
     - **Graph**: Read
     - **Release**: Read & Execute
   - Click "Create" and copy the generated token

2. **Configure your `.env` file**:
   ```
   AZURE_DEVOPS_AUTH_METHOD=pat
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
   AZURE_DEVOPS_PAT=your-personal-access-token
   AZURE_DEVOPS_DEFAULT_PROJECT=your-default-project
   ```

### Security Considerations

- PATs have an expiration date and will need to be renewed
- Store your PAT securely and never commit it to source control
- Consider using environment variables or a secrets manager in production
- Scope your PAT to only the permissions needed for your use case

## Troubleshooting Authentication Issues

### PAT Authentication Issues

1. **Invalid PAT**: Ensure your PAT hasn't expired and has the required scopes

   - Error: `TF400813: The user 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' is not authorized to access this resource.`
   - Solution: Generate a new PAT with the correct scopes

2. **Scope issues**: If receiving 403 errors, check if your PAT has the necessary permissions

   - Error: `TF401027: You need the Git 'Read' permission to perform this action.`
   - Solution: Update your PAT with the required scopes

3. **Organization access**: Verify your PAT has access to the organization specified in the URL
   - Error: `TF400813: Resource not found for anonymous request.`
   - Solution: Ensure your PAT has access to the specified organization

## Best Practices

1. **Choose the right authentication method for your environment**:

   - For local development: Azure CLI or PAT
   - For CI/CD pipelines: PAT or service principal
   - For Azure-hosted applications: Managed Identity

2. **Follow the principle of least privilege**:

   - Only grant the permissions needed for your use case
   - Regularly review and rotate credentials

3. **Secure your credentials**:

   - Use environment variables or a secrets manager
   - Never commit credentials to source control
   - Set appropriate expiration dates for PATs

4. **Monitor and audit authentication**:
   - Review Azure DevOps access logs
   - Set up alerts for suspicious activity

## Examples

### Example 1: Local Development with PAT

```bash
# .env file
AZURE_DEVOPS_AUTH_METHOD=pat
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/mycompany
AZURE_DEVOPS_PAT=abcdefghijklmnopqrstuvwxyz0123456789
AZURE_DEVOPS_DEFAULT_PROJECT=MyProject
AZURE_DEVOPS_USERNAME=your-username
NODE_TLS_REJECT_UNAUTHORIZED=0
```
