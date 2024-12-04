// Importación de librerías y módulos para la configuración de la base de datos MySQL
import production from './env/production.js';
import development from './env/development.js';
// Configuración del entorno de desarrollo que se utilizará
const envConfig = process.env.NODE_ENV === 'production' ? production : development;
// Configuración general de la aplicación
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
  dropbox: {
    accessToken: process.env.DROPBOX_ACCESS_TOKEN // Nueva configuración para Dropbox
  },
  ...envConfig,
};
// Exportar la configuración general de la aplicación
export default config;