module.exports = {
	name: "purge",
    description: "Delete [count] messages from the current channel (default is 1).",
    usage: "<count>",
	execute(message, count = 1) {
        let channel = message.channel;
        let num = parseInt(count);
        if (isNaN(num) || num <= 0) num = 1;

        // Inc. count by one to account for the issued delete command
        channel.bulkDelete(num+1)
            .then((messages) => {
                return channel.send(`Deleted ${messages.size-1} messages`);
            }).catch((err) => {
                console.error(err);
                return channel.send("Ran into an error while deleting message(s)");
            });
	}
};