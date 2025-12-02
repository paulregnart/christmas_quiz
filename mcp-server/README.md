# Christmas Quiz MCP Server

This is a Model Context Protocol (MCP) server that allows AI assistants to interact with and control the Christmas Quiz game.

## Features

The MCP server provides the following tools:

- **get_game_state** - View current game state (teams, scores, question, timer)
- **get_questions** - List all quiz questions
- **get_team_urls** - Get team leader join URLs
- **start_question** - Start a specific question
- **reveal_answers** - Show answers and update scores
- **reset_game** - Reset the entire game
- **get_leaderboard** - View current rankings

## Setup

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure backend URL in `.env`:
```env
QUIZ_BACKEND_URL=http://localhost:3001
```

## Using with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "christmas-quiz": {
      "command": "node",
      "args": [
        "/Users/paulregnart/Christmas Quiz/mcp-server/index.js"
      ],
      "env": {
        "QUIZ_BACKEND_URL": "http://localhost:3001"
      }
    }
  }
}
```

For production (Render):
```json
{
  "mcpServers": {
    "christmas-quiz": {
      "command": "node",
      "args": [
        "/Users/paulregnart/Christmas Quiz/mcp-server/index.js"
      ],
      "env": {
        "QUIZ_BACKEND_URL": "https://christmas-quiz.onrender.com"
      }
    }
  }
}
```

## Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load the MCP server.

## Example Usage in Claude

Once configured, you can ask Claude:

- "What's the current game state?"
- "Show me the leaderboard"
- "Start question 5"
- "Reveal the answers"
- "Reset the game"
- "Give me all the team URLs"

## Deployment to Render (Optional)

If you want to run this as a web service on Render:

1. This MCP server uses stdio transport, which is designed for local AI assistants
2. For remote access, you'd need to implement an HTTP or WebSocket transport
3. The current setup is perfect for controlling your quiz from Claude Desktop on your machine

## Development

The server connects to your quiz backend and proxies commands through the MCP protocol. It doesn't store any state - all game state lives in the backend.
