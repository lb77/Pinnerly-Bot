module.exports = {
	name: "add",
    description: "Add a rule to mirror pins from one channel to another.",
    usage: "<channelFrom> <channelTo>",
	async execute(message) {
        let [channelFrom, channelTo] = message.mentions.channels.first(2);

        if (!channelFrom || !channelTo) {
            return message.reply(`Please provide valid channels to mirror between (cannot add rule: ${channelFrom} -> ${channelTo})`);
        }

        try {
            let pins = await channelFrom.messages.fetchPinned();
            let guildData = message.client.guildData.get(message.guildId);

            guildData.cachedPins.set(channelFrom.id, pins);
            await message.client.db.addRule(message.guildId, channelFrom.id, channelTo.id);

            return message.channel.send(`Pinnerly Bot will now mirror pins from ${channelFrom} to ${channelTo}`);
        } catch (err) {
            console.error(err);

            if (err.name === "SequelizeUniqueConstraintError") {
                return message.reply("Rule already exists!");
            }

            return message.reply(`Could not add rule: ${channelFrom} -> ${channelTo}`);
        }
	}
};