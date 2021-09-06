module.exports = {
	name: "migrateall",
    description: "Migrates all pinned messages in the current channel.",
    usage: "",
	async execute(message) {
        // Arbitrary count given, we just want to move all pins
        message.client.commands.get("migrate").execute(message.channel, 100);
	}
};