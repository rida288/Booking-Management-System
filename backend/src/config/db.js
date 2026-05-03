const sql = require('mssql')
require("dotenv").config();

// configuration for sql server 
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeout: 30000, // Wait 30 seconds for connection
    requestTimeout: 60000, // Wait 60 seconds for queries
    options: {
        encrypt: false, 
        enableArithAbort: true
    }, 
    port: parseInt(process.env.DB_PORT)
};

// create connection to export as a promise 
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err)
        throw err;
    });

module.exports = {
    sql, poolPromise
};