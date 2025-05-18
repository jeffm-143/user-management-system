const config = require('../../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
  // create db if it doesn't already exist
  const { host, port, user, password, database } = config.database;
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

  // define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);
  
  // Department-Employee relationship
db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });
db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId', as: 'department' });

  // Employee-Request relationship
db.Employee.hasMany(db.Request, { foreignKey: 'employeeId' });
db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });

  // Request-RequestItem relationship
db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId', onDelete: 'CASCADE' });
db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

  // Employee-Workflow relationship
db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

  // Account-Employee relationship
db.Account.hasOne(db.Employee, { foreignKey: 'userId' });
db.Employee.belongsTo(db.Account, { foreignKey: 'userId', as: 'user' });

  // sync all models with database
  await sequelize.sync({ alter: true });
}
