const db1 = {
    host: "localhost",
    user: "root",
    password: "",
    database: 'payroll'
}
const db2 = {
    user: 'datgavl',
    password: 'datgavl',
    database: 'HR',
    server: 'localhost',
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
      }
    }
module.exports = { db1, db2 }