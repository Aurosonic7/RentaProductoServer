import cors from 'cors';

const corsMiddleware = cors({
  origin: 'http://localhost:8100',
  optionsSuccessStatus: 200,
  methods: [ 'GET', 'POST', 'PUT', 'DELETE', ],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
});

export default corsMiddleware;