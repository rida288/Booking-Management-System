const sql = require("mssql");

const config = {
    server: "localhost",
    database: "Booking_Management_System",
    user: "appuser",
    password: "App@12345",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: "SQLEXPRESS"
    },
    connectionTimeout: 30000,
    requestTimeout: 60000
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to SQL Server");
        return pool;
    })
    .catch(err => {
        console.error("Database Connection Failed!", err);
        throw err;
    });

module.exports = { sql, poolPromise };
