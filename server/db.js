const mysql=require('mysql2')
const config=require('./config')

const pool=mysql.createPool({
    host:config.host,
    user:config.user,
    database:config.database,
    port:config.port,
    password:config.password,
    waitForConnections:true,
    connectionLimit:10,
    maxIdle:10,
    idleTimeout:6000,
    queueLimit:0,
    enableKeepAlive:true,
    keepAliveInitialDelay:0,

})

module.exports={
    pool,
}