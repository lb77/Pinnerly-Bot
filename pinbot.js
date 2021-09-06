/*
*   TODO:
*    - Using mentions.channels in remove.js can be problematic for rules with deleted channels
*    - utils.js is probably unnecessary
*    - Some arrow functions might be better as named functions
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

// Webhook rate limit per channel is currently 30 msgs/60 secs
client.MAX_PINS = Config.max_pins;
client.db = Database.init(Config.db, force);
client.commands = new Collection();
client.utils = require("./lib/utils");

const commandFiles = fs.readdirSync("./lib/commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./lib/commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", async () => {
    debugger;
    client.guildData = new Collection();

    // Retrieve info for each guild
    let guildInfo = await Promise.allSettled(client.guilds.cache.map((guild) => {
        // Group queries into [Guild, Settings, Rules] promise array
        return Promise.allSettled([
            guild,
            client.db.getGuild(guild.id),
            client.db.getRules(guild.id)
        ]);
    })).catch(console.error);
    
    guildInfo.map((obj) => {
        let [guildObj, settings, rules] = obj.value;
        return {
            guildObj: guildObj.value,
            settings: settings.value,
            rules: rules.value
        }
    }).forEach(async (guild) => {
        try {
            // Cooldowns are enforced per channel, but the actual setting is guild-wide (a) b/c I'm lazy and (b) because I'd need to figure out good UX to set it otherwise
            let guildDataObj = {
                cooldown: guild.settings.cooldown,
                cachedPins: new Collection()
            };

            // Cache pins for each channel
            guild.rules.forEach(async (rule) => {
                if (guildDataObj.cachedPins.get(rule.channelFrom)) return;

                let channel = guild.guildObj.channels.resolve(rule.channelFrom);
                guildDataObj.cachedPins.set(channel.id, await channel.messages.fetchPinned());
            });

            client.guildData.set(guild.guildObj.id, guildDataObj);
        } catch (err) {
            console.error(err);
        }
    });

    client.user.setActivity(Config.activity);
    console.log("Client ready!");
});

client.on("guildCreate", (guild) => {
    // client.db.getGuild creates Settings entry if nonexistent
    client.db.getGuild(guild.id).catch(console.err);
});

client.on("channelPinsUpdate", async (channel) => {
    let pins = await channel.messages.fetchPinned();
    let guildData = client.guildData.get(channel.guild.id);
    let oldSize = guildData.cachedPins.get(channel.id)?.size;

    guildData.cachedPins.set(channel.id, pins);

    // Means pin was added
    if (pins.size > oldSize) {
        client.commands.get("migrate").execute(channel, 1);
    }
});

client.on("messageCreate", (message) => {
    // All of these cases are irrelevant to us
    if (message.author.bot ||
        message.channel.type === "dm" ||
        !message.content.startsWith(Config.prefix)) {
            return;
    }

    console.log(message.content);

    let args = message.content.slice(Config.prefix.length).split(/\s+/);
    let commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

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

client.login(Config.token);