# Supabase MCP Server Configuration

This directory contains the configuration for the Supabase Model Context Protocol (MCP) server.

## Setup Instructions

### 1. Get Your Supabase Personal Access Token

1. Go to your [Supabase settings](https://supabase.com/dashboard/account/tokens)
2. Create a new personal access token
3. Give it a descriptive name like "Cursor MCP Server"
4. Copy the token (you won't be able to see it again)

### 2. Get Your Project Reference

1. Go to your Supabase project dashboard
2. Navigate to Project Settings → General
3. Copy the "Project ID" (this is your project reference)

### 3. Update the Configuration

Edit the `mcp.json` file in this directory:

1. Replace `YOUR_SUPABASE_ACCESS_TOKEN_HERE` with your personal access token
2. Replace `YOUR_PROJECT_REF_HERE` with your project ID

### 4. Restart Cursor

After updating the configuration, restart Cursor for the changes to take effect.

## Configuration Options

The current configuration includes:

- `--read-only`: Restricts the server to read-only queries (recommended for safety)
- `--project-ref`: Scopes the server to a specific project (recommended for security)

### Additional Features

You can customize the MCP server by adding these optional flags to the `args` array:

- `--features=database,docs`: Enable only specific tool groups
  - Available groups: `account`, `docs`, `database`, `debug`, `development`, `functions`, `storage`, `branching`
  - Default: `account`, `database`, `debug`, `development`, `docs`, `functions`, `branching`

### Example Advanced Configuration

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF_HERE",
        "--features=database,docs,development"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

## Available Tools

Once configured, the MCP server provides these tool groups:

### Database Tools

- `list_tables`: Lists all tables within specified schemas
- `list_extensions`: Lists all database extensions
- `execute_sql`: Executes raw SQL queries (read-only mode)
- `apply_migration`: Applies SQL migrations
- `list_migrations`: Lists all migrations

### Documentation Tools

- `search_docs`: Searches Supabase documentation for up-to-date information

### Development Tools

- `get_project_url`: Gets the API URL for the project
- `get_anon_key`: Gets the anonymous API key
- `generate_typescript_types`: Generates TypeScript types from database schema

### Debug Tools

- `get_logs`: Gets logs by service type (api, postgres, edge functions, auth, storage, realtime)
- `get_advisors`: Gets advisory notices for security vulnerabilities or performance issues

### Edge Functions Tools

- `list_edge_functions`: Lists all Edge Functions
- `deploy_edge_function`: Deploys new or updates existing Edge Functions

## Security Best Practices

1. **Use Read-Only Mode**: Always use `--read-only` flag for safety
2. **Project Scoping**: Use `--project-ref` to limit access to a specific project
3. **Development Projects**: Use with development/staging projects, not production
4. **Review Tool Calls**: Always review MCP tool calls before executing them in Cursor

## Troubleshooting

### Common Issues

1. **Token Not Working**: Make sure you copied the token correctly and it hasn't expired
2. **Project Not Found**: Verify your project ID is correct
3. **Permission Errors**: Ensure your Supabase account has access to the project

### Checking Installation

You can verify the MCP server is working by running:

```bash
npx -y @supabase/mcp-server-supabase@latest --help
```

This will show available options and confirm the package can be downloaded.

## Dependencies

The MCP server will automatically install these dependencies when first run:

- `@supabase/mcp-server-supabase`: The main MCP server package
- Node.js dependencies for Supabase client libraries

No manual installation of dependencies is required - `npx` handles everything automatically.
