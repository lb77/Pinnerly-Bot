module.exports = {
	name: "listrules",
    description: "List rules that are currently set up for this guild. Can optionally specify a channel to fiilter by.",
    usage: "[<channelFrom>]",
	async execute(message) {
        let channelFrom = message.mentions.channels.first();

        try {
            let rules = await message.client.db.getRules(message.guild.id, channelFrom?.id);
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