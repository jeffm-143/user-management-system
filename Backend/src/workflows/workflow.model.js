const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        details: { type: DataTypes.JSON, allowNull: true },
        status: { type: DataTypes.STRING, defaultValue: 'Pending' }
    };
    return sequelize.define('Workflow', attributes);
}