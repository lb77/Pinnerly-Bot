module.exports = {
	name: "listrules",
    description: "List all rules in the server, or list rules for a specific channel.",
    usage: "[<channelFrom>]",
	async execute(message) {
        let channelFrom = message.mentions.channels.first();

        try {
            let rules = await message.client.db.getRules(message.guildId, channelFrom?.id);
            let ruleCtx = channelFrom ? channelFrom : "this guild";

            if (rules.length) {
                let output = [`Rules set up for ${ruleCtx}:`];

                rules.forEach((rule) => {
                    output.push(`<#${rule.channelFrom}> -> <#${rule.channelTo}>`);
                });

                return message.channel.send(output.join('\n'));
            } else {
                return message.reply(`No rules set up for ${ruleCtx}!`);
            }
        } catch (err) {
            console.error(err);
            return message.reply("There was a problem retrieving rules!");
        }
	}
};