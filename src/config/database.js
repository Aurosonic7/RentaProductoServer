import mysql from './databases/mysql.js';
import logger from '../utils/logger.js';

const databases = [
  { name: 'MySQL', initialize: mysql.initialize, close: mysql.close },
];

const handleDatabaseConnections = async (action) => {
  const connections = await Promise.allSettled(databases.map(db => db[action]()));

  connections.forEach((connection, index) => {
    const dbName = databases[index].name;
    if (connection.status === 'fulfilled') logger.info(`${dbName} database ${action}ed successfully`);
    else logger.error(`${dbName} database failed to ${action}`, { reason: connection.reason });
  });
  return connections;
};

const initializeDatabases = () => handleDatabaseConnections('initialize');
const closeDatabases = () => handleDatabaseConnections('close');

export default { initializeDatabases, closeDatabases };