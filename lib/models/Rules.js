module.exports = (sequelize, DataTypes) => {
    return sequelize.define("rules", {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channelFrom: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        channelTo: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });
}