//Importación de librerías y módulos necesarios para la configuración de la base de datos MySQL
import mysql from './databases/mysql.js';
import logger from '../utils/logger.js';
// Definición de las bases de datos que se utilizarán en la aplicación
const databases = [
  { name: 'MySQL', initialize: mysql.initialize, close: mysql.close },
];
// Función para manejar las conexiones a las bases de datos
const handleDatabaseConnections = async (action) => {
  const connections = await Promise.allSettled(databases.map(db => db[action]()));

  connections.forEach((connection, index) => {
    const dbName = databases[index].name;
    if (connection.status === 'fulfilled') logger.info(`${dbName} database ${action}ed successfully`);
    else logger.error(`${dbName} database failed to ${action}`, { reason: connection.reason });
  });
  return connections;
};
// Funciones para inicializar y cerrar las conexiones a las bases de datos
const initializeDatabases = () => handleDatabaseConnections('initialize');
const closeDatabases = () => handleDatabaseConnections('close');
// Exportar las funciones para manejar las conexiones a las bases de datos
export default { initializeDatabases, closeDatabases };