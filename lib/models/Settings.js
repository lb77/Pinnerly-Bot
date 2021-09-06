module.exports = (sequelize, DataTypes) => {
    return sequelize.define("settings", {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        cooldown: {
            type: DataTypes.INTEGER,
            default: 0
        }
    }, {
        timestamps: false
    });
}