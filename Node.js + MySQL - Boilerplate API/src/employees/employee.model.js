const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: { 
            type: DataTypes.STRING, 
            allowNull: false,
            defaultValue: () => `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` 
        },
        userId: { type: DataTypes.INTEGER },
        position: { type: DataTypes.STRING },
        departmentId: { type: DataTypes.INTEGER },
        hireDate: { type: DataTypes.DATE },
        status: { type: DataTypes.STRING, defaultValue: 'Active' }
    };

    return sequelize.define('Employee', attributes);
}