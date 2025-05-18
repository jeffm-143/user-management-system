const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const host = process.env.DB_HOST || '153.92.15.31';
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || 'u875409848_sagaral';
    const password = process.env.DB_PASSWORD || '9T2Z5$3UKkgSYzE';
    const database = process.env.DB_NAME || 'u875409848_sagaral';

    const connection = await mysql.createConnection({ host, user, password, port });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql'
    });

    // init models and add them to the exported db object
    db.Account = require('../_accounts/account.model')(sequelize);
    db.RefreshToken = require('../_accounts/refresh-token.model')(sequelize);
    db.Department = require('../departments/department.model')(sequelize);
    db.Employee = require('../employees/employee.model')(sequelize);
    db.Request = require('../request/request.model')(sequelize);
    db.RequestItem = require('../request/request-item.model')(sequelize);
    db.Workflow = require('../workflows/workflow.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
}