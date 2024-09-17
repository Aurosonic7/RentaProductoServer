import fs from 'fs';
import http from 'http';
import https from 'https';
import server from './server.js';
import config from './config/config.js';
import database from './config/database.js';

const { httpPort: HTTP_PORT, httpsPort: HTTPS_PORT } = config.app;

async function startServer() {
  try {
    const credentials = {
      key: fs.readFileSync('./certificates/aurosonic.key', 'utf8'),
      cert: fs.readFileSync('./certificates/aurosonic.cert', 'utf8')
    };

    await database.initializeDatabases();

    const httpServer = http.createServer(server);
    const httpsServer = https.createServer(credentials, server);

    httpServer.listen(HTTP_PORT, () => console.log(`HTTP Server running at http://localhost:${HTTP_PORT}/api`));
    httpsServer.listen(HTTPS_PORT, () => console.log(`HTTPS Server running at https://localhost:${HTTPS_PORT}/api`));

    process.on('SIGINT', async () => {
      console.info('SIGINT signal received.');
      console.log('Closing servers and database connections...');
      await Promise.all([
        new Promise(resolve => httpServer.close(() => resolve(console.log('HTTP server closed')))),
        new Promise(resolve => httpsServer.close(() => resolve(console.log('HTTPS server closed')))),
        database.closeDatabases().then(() => console.log('Database connections closed'))
      ]);
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
}

startServer();