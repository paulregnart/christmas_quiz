#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.QUIZ_BACKEND_URL || 'http://localhost:3001';

// Create MCP server
const server = new Server(
  {
    name: 'christmas-quiz-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_game_state',
        description: 'Get the current state of the quiz game including teams, scores, current question, and timer',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_questions',
        description: 'Get all available quiz questions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_team_urls',
        description: 'Get all team leader URLs for joining the game',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'start_question',
        description: 'Start the next question in the quiz',
        inputSchema: {
          type: 'object',
          properties: {
            questionIndex: {
              type: 'number',
              description: 'The index of the question to start (0-14)',
            },
          },
          required: ['questionIndex'],
        },
      },
      {
        name: 'reveal_answers',
        description: 'Reveal the answers for the current question and update scores',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'reset_game',
        description: 'Reset the entire game state (scores, answers, teams)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_leaderboard',
        description: 'Get the current leaderboard with team rankings',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_game_state': {
        const response = await axios.get(`${BACKEND_URL}/api/game-state`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_questions': {
        const response = await axios.get(`${BACKEND_URL}/api/questions`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_team_urls': {
        const response = await axios.get(`${BACKEND_URL}/api/team-urls`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'start_question': {
        const response = await axios.post(`${BACKEND_URL}/api/start-question`, {
          questionIndex: args.questionIndex,
        });
        return {
          content: [
            {
              type: 'text',
              text: `Question ${args.questionIndex + 1} started successfully`,
            },
          ],
        };
      }

      case 'reveal_answers': {
        const response = await axios.post(`${BACKEND_URL}/api/reveal-answers`);
        return {
          content: [
            {
              type: 'text',
              text: 'Answers revealed and scores updated',
            },
          ],
        };
      }

      case 'reset_game': {
        const response = await axios.post(`${BACKEND_URL}/api/reset-game`);
        return {
          content: [
            {
              type: 'text',
              text: 'Game has been reset successfully',
            },
          ],
        };
      }

      case 'get_leaderboard': {
        const stateResponse = await axios.get(`${BACKEND_URL}/api/game-state`);
        const teams = stateResponse.data.teams;
        
        // Sort teams by score
        const leaderboard = Object.entries(teams)
          .filter(([_, team]) => team.name)
          .map(([id, team]) => ({
            team: team.name,
            score: team.score,
            connected: team.connected,
          }))
          .sort((a, b) => b.score - a.score);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(leaderboard, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Christmas Quiz MCP Server running on stdio');
  console.error(`Connected to backend: ${BACKEND_URL}`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
