/*
*   TODO:
*    - Maybe optimize error handling? (Could bubble up generic errors to client message listener)
*/

const {Client, Intents, Collection} = require("discord.js");
const fs = require("fs");
const Config = require("./config");
const Database = require("./lib/database");

const client = new Client({intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
]});
const force = process.argv.includes("--reset") || process.argv.includes("-r");

client.db = Database.init(Config.db, force);
client.commands = new Collection();
client.utils = require("./lib/utils");

const commandFiles = fs.readdirSync("./lib/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./lib/commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", async function() {
    client.guildData = new Collection();

    // Retrieve info for each guild
    client.guilds.fetch().then(guilds => guilds.forEach(guild =>
        guild.fetch().then(async function (guild) {
            let settings = await client.db.getGuild(guild.id);
            let rules = await client.db.getRules(guild.id);
            let deletedRules = new Collection();
            // Cooldowns are enforced per channel, but the actual setting is guild-wide (a) b/c I'm lazy and (b) because I'd need to figure out good UX to set it otherwise
            let guildDataObj = {
                cooldown: settings.cooldown,
                cachedPins: new Collection()
            }

            // Cache pins for each channel
            rules.forEach(async function (rule) {
                if (guildDataObj.cachedPins.get(rule.channelFrom)) return;

                let channel = guild.channels.resolve(rule.channelFrom);

                if (!channel) {
                    if (!deletedRules.has(rule.channelFrom)) {
                        let count = await client.db.autoremoveRules(guild.id, rule.channelFrom);
                        deletedRules.set(rule.channelFrom, count);
                        guild.systemChannel?.send(`Deleted ${count} rules containing deleted channel ${rule.channelFrom}`);
                    }
                    return;
                }

                guildDataObj.cachedPins.set(channel.id, await channel.messages.fetchPinned());
            });

            client.guildData.set(guild.id, guildDataObj);
        })
    ));

    client.user.setActivity(Config.activity);
    console.log("Client ready!");
});

client.on("guildCreate", function (guild) {
    // client.db.getGuild creates Settings entry if nonexistent
    client.db.getGuild(guild.id).catch(console.err);
});

client.on("messageCreate", function (message) {
    // All of these cases are irrelevant to us
    if (message.author.bot ||
        message.channel.type === "dm" ||
        !message.content.startsWith(Config.prefix)) {
        return;
    }

    let args = message.content.slice(Config.prefix.length).split(/\s+/);
    let commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;
    console.log(message.content);

    let command = client.commands.get(commandName);
    if (command.permissions && !message.member.hasPermission(command.permissions)) {
        return message.reply("insufficient permissions");
    };

    try {
        // "migrate" command requires channel rather than message as first param (due to channelPinsUpdate handler)
        let param = commandName === "migrate" ? message.channel : message;
        command.execute(param, ...args);
    } catch (err) {
        console.error(err);
        message.reply("couldn't execute that command");
    }
});

client.on("channelPinsUpdate", async function (channel) {
    let pins = await channel.messages.fetchPinned();
    let guildData = client.guildData.get(channel.guildId);
    let oldSize = guildData.cachedPins.get(channel.id)?.size;

    guildData.cachedPins.set(channel.id, pins);

    // Means pin was added
    if (pins.size > oldSize) {
        client.commands.get("migrate").execute(channel, 1);
    }
});

client.on("channelDelete", async function (channel) {
    let count = await client.db.autoremoveRules(channel.guildId, channel.id);
    channel.guild.systemChannel?.send(`Deleted ${count} rules after deletion of #${channel.name} (ID: ${channel.id})`);
});

client.login(Config.token);

process.on("SIGINT", function () {
    client.destroy();
    process.exit(0);
});