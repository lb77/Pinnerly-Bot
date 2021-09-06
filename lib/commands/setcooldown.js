module.exports = {
	name: "setcooldown",
    description: "Set a cooldown (in seconds) for pinbot after each new pin.",
    usage: "<seconds>",
	async execute(message, num) {
        let guildData = message.client.guildData.get(message.guild.id);
        let secs = parseInt(num);
        if (isNaN(secs) || secs <= 0) secs = 1;

        try {
            let count = await message.client.db.updateGuild(message.guild.id, {
                cooldown: secs
            });

            if (count) {
                guildData.cooldown = secs;
                return message.channel.send(`Pinbot will now be on cooldown for ${secs} seconds after each new pin`);
            } else {
                throw new Error(`No guilds updated on setcooldown call for guild ${message.guild.id}`);
            }
        } catch (err) {
            console.error(err);
            return message.reply(`Could not set new cooldown (Current setting: ${guildData.cooldown} seconds)`);
        }
	}
};