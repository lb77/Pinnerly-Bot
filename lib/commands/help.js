const { prefix } = require("../../config.json")

module.exports = {
	name: "help",
    description: "List of all commands or info about a specific command.",
	execute(message, commandName) {
        let data = [];
        let {commands} = message.client;

        if (!commandName) {
            data.push("Here's a list of all my commands:");
            data.push(commands.map(command => `\`${command.name}\``).join(", "));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command.`);
            
            return message.channel.send(data.join('\n'));
        }

        let command = commands.get(commandName);
        if (!command) return message.reply("That's not a valid command!");

        data.push(`**Name:** ${command.name}`);

        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);

        return message.channel.send(data, {split: true});
	}
};