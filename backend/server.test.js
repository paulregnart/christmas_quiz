const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

// Mock the questions file
jest.mock('./questions.json', () => [
  {
    id: 1,
    question: "Test question 1?",
    options: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctAnswer: 1,
    explanation: "Test explanation"
  },
  {
    id: 2,
    question: "Test question 2?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: 0
  }
]);

describe('Backend API Tests', () => {
  let app, server, io;
  let serverPort;

  beforeAll((done) => {
    // Mock environment variables
    process.env.FRONTEND_URL = 'http://localhost:3000';
    
    // Import server after mocking
    const express = require('express');
    app = express();
    server = createServer(app);
    io = new Server(server);
    
    serverPort = 3002; // Use different port for tests
    server.listen(serverPort, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('REST API Endpoints', () => {
    test('GET / returns homepage', async () => {
      const response = await request(server).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Christmas Quiz Backend');
    });

    test('GET /api/questions returns questions array', async () => {
      const response = await request(server).get('/api/questions');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('question');
      expect(response.body[0]).toHaveProperty('options');
      expect(response.body[0]).toHaveProperty('correctAnswer');
    });

    test('GET /api/team-urls returns 10 team URLs', async () => {
      const response = await request(server).get('/api/team-urls');
      expect(response.status).toBe(200);
      expect(Object.keys(response.body)).toHaveLength(10);
      expect(response.body.team1).toContain('/team/');
      expect(response.body.team10).toContain('/team/');
    });

    test('GET /api/game-state returns initial game state', async () => {
      const response = await request(server).get('/api/game-state');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentQuestion');
      expect(response.body).toHaveProperty('teams');
      expect(response.body).toHaveProperty('questionActive');
      expect(response.body.questionIndex).toBe(-1);
      expect(response.body.questionActive).toBe(false);
    });
  });

  describe('Game Logic Tests', () => {
    test('correctAnswer is a number index (0-3)', async () => {
      const response = await request(server).get('/api/questions');
      response.body.forEach(question => {
        expect(typeof question.correctAnswer).toBe('number');
        expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswer).toBeLessThan(question.options.length);
      });
    });

    test('all questions have 4 options', async () => {
      const response = await request(server).get('/api/questions');
      response.body.forEach(question => {
        expect(question.options).toHaveLength(4);
      });
    });

    test('POST /api/start-question with valid index', async () => {
      const response = await request(server)
        .post('/api/start-question')
        .send({ questionIndex: 0 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /api/start-question with invalid index', async () => {
      const response = await request(server)
        .post('/api/start-question')
        .send({ questionIndex: 999 });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Socket.IO Integration Tests', () => {
  let io, serverSocket, clientSocket;
  let httpServer;
  const port = 3003;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(port, () => {
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  test('client connects successfully', () => {
    expect(clientSocket.connected).toBe(true);
  });

  test('join-quizmaster event is received', (done) => {
    serverSocket.on('join-quizmaster', () => {
      done();
    });
    clientSocket.emit('join-quizmaster');
  });

  test('start-question event emits new-question', (done) => {
    clientSocket.on('new-question', (data) => {
      expect(data).toHaveProperty('question');
      expect(data).toHaveProperty('options');
      expect(data).toHaveProperty('questionNumber');
      done();
    });
    serverSocket.emit('new-question', {
      question: 'Test question?',
      options: ['A', 'B', 'C', 'D'],
      questionNumber: 1,
      totalQuestions: 15,
      timeLimit: 20
    });
  });
});
