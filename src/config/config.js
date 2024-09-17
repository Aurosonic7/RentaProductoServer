import production from './env/production.js';
import development from './env/development.js';

const envConfig = process.env.NODE_ENV === 'production' ? production : development;

const config = {
  app: { httpPort: process.env.HTTP_PORT || 8081, httpsPort: process.env.HTTPS_PORT || 8082 },
  jwt: { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN }, 
  db: {
    mysqlHost: envConfig.db.mysqlHost,
    mysqlPort: envConfig.db.mysqlPort,
    mysqlUser: envConfig.db.mysqlUser,
    mysqlPassword: envConfig.db.mysqlPassword,
    mysqlDatabase: envConfig.db.mysqlDatabase
  },
  ...envConfig,
};

export default config;