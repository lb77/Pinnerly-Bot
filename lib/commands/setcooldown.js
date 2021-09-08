module.exports = {
	name: "setcooldown",
    description: "Set the cooldown for Pinnerly Bot after each new pin (default is 0).",
    usage: "<seconds>",
	async execute(message, num) {
        let guildData = message.client.guildData.get(message.guildId);
        let secs = parseInt(num);
        if (isNaN(secs) || secs <= 0) secs = 1;

        try {
            let count = await message.client.db.updateGuild(message.guildId, {
                cooldown: secs
            });

            if (count) {
                guildData.cooldown = secs;
                return message.channel.send(`Pinnerly Bot will now be on cooldown for ${secs} seconds after each new pin`);
            } else {
                throw new Error(`No guilds updated on setcooldown call for guild ${message.guildId}`);
            }
        } catch (err) {
            console.error(err);
            return message.reply(`Could not set new cooldown (Current setting: ${guildData.cooldown} seconds)`);
        }
	}
};