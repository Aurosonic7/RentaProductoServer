const production = {
  db: {
    mysqlHost: process.env.DB_HOST,
    mysqlPort: process.env.DB_PORT,
    mysqlUser: process.env.DB_USER,
    mysqlPassword: process.env.DB_PASSWORD,
    mysqlDatabase: process.env.DB_DATABASE
  },
};

export default production;