const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        requestId: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.INTEGER, allowNull: false }
    };

    return sequelize.define('RequestItem', attributes);
}