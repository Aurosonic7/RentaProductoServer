const development = {
  db: {
    mysqlHost: process.env.DEV_DB_HOST,
    mysqlPort: process.env.DEV_DB_PORT,
    mysqlUser: process.env.DEV_DB_USER,
    mysqlPassword: process.env.DEV_DB_PASSWORD,
    mysqlDatabase: process.env.DEV_DB_DATABASE
  },
};

export default development;