module.exports = {
	name: "migrate",
    description: "Migrate [count] pins from the current channel to each of its mirrors (default is 1).",
    usage: "<count>",
	async execute(channel, count = 1) {
        // Cooldowns are enforced per channel, but the actual setting is guild-wide (a) b/c I'm lazy and (b) because need to figure out good UX to set it otherwise
        let guildData = channel.client.guildData.get(channel.guildId);
        let timeElapsed = Math.max(Date.now() - channel.lastPinTimestamp, 0);

        if (timeElapsed < guildData.cooldown) return;

        let num = parseInt(count) || 1;
        let failedChannels = [];

        try {
            let channelsTo = await channel.client.db
                .getRules(channel.guildId, channel.id)
                .then((rules) => rules.reduce((res, rule) => {
                    let channelTo = channel.guild.channels.resolve(rule.channelTo);
                    if (!channelTo) failedChannels.push(channelTo);
                    else res.push(channelTo);

                    return res;
                }, []));

            if (!channelsTo.length) {
                return channel.send("No rules set up for this channel!");
            }

            let pinsToMove = guildData.cachedPins.get(channel.id).first(num);

            pinsToMove.forEach(async (msg) => {
                let embeds = channel.client.utils.createEmbedsFromPin(msg);
                
                channelsTo.forEach(async (channelTo) => {
                    channelTo.send({embeds});
                });

                msg.unpin().then((msg) => msg.react("📌"));
            });

            if (failedChannels.length > 0) {
                channel.send(`Could not mirror pins to the following channels: <#${failedChannels.join(">, <#")}>`);
            }

            channel.client.lastPinUpdate = Date.now();
        } catch (err) {
            console.error(err);
            return channel.send(`Ran into an error while migrating pins from <#${channel.id}>`);
        }
	}
};