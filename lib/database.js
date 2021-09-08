const Sequelize = require("sequelize");

class Database {
    constructor(dbname, force) {
        const sequelize = new Sequelize({
            dialect: "sqlite",
            storage: dbname
        });

        this.guildSettings = require("./models/Settings")(sequelize, Sequelize.DataTypes);
        this.guildRules = require("./models/Rules")(sequelize, Sequelize.DataTypes);

        sequelize.sync({force}).then(async () => {
            console.log("Database synced");
        }).catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }

    /* Returns found or created guild entry in Settings table  */
    async getGuild(gid) {
        // findOrCreate's full return is [result, created]
        let [guild] = await this.guildSettings.findOrCreate({
            where: {guildId: gid},
            defaults: {guildId: gid}
        });

        if (!guild) throw `Could not find or create guild: ${gid}`;
        return guild;
    }

    /* Returns count of updated entries in Settings table */
    async updateGuild(gid, vals) {
        let count = await this.guildSettings.update(vals, {where: {guildId: gid}});
        return count;
    }

    /* Returns created rule entry in GuildRules table */
    async addRule(gid, channelFrom, channelTo) {
        let rule = await this.guildRules.create({
            guildId: gid,
            channelFrom: channelFrom,
            channelTo: channelTo
        });
        return rule;
    }

    /* Returns rules in GuildRules table filtered by guild ID (and additionally channelFrom ID, if specified) */
    async getRules(gid, channelFrom) {
        // channelFrom property optionally included if not undefined
        let rules = await this.guildRules.findAll({where: {
            guildId: gid,
            ...channelFrom && {channelFrom}
        }});
        return rules;
    }

    /* Returns count of rows destroyed in GuildRules table */
    async removeRule(gid, channelFrom, channelTo) {
        let count = await this.guildRules.destroy({
            where: {
                guildId: gid,
                channelFrom: channelFrom,
                channelTo: channelTo
            }
        });
        return count;
    }

    /* Returns count of rows destroyed in GuildRules table that contain channelId in either channelTo or channelFrom fields (e.g. if channel was deleted) */
    async autoremoveRules(gid, channelId) {
        let count = await this.guildRules.destroy({
            where: {
                guildId: gid,
                [Sequelize.Op.or]: [
                    {channelFrom: channelId},
                    {channelTo: channelId}
                ]
            }
        });
        return count;
    }
}

module.exports = {
    init: (dbname, force) => new Database(dbname, force)
}