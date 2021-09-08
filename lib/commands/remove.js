module.exports = {
	name: "remove",
    description: "Remove an existing pin mirroring rule.",
    usage: "<channelFrom> <channelTo>",
	async execute(message) {
        let [channelFrom, channelTo] = message.mentions.channels.first(2);

        try {
            let rowCount = await message.client.db.removeRule(message.guildId, channelFrom?.id, channelTo?.id);

            if (!rowCount) return message.reply("Rule does not exist!");

            return message.channel.send(`Pinnerly Bot will no longer mirror pins from ${channelFrom} to ${channelTo}`);
        } catch (err) {
            console.error(err);
            return message.reply(`Could not remove rule: ${channelFrom} -> ${channelTo}`);
        }
	}
};