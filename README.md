# Pinnerly Bot

The Pinnerly Bot! The Pinnerly Bot! It will let Discord limit your pins not!


Pinnerly Bot is a scalable solution for when multiple channels run out of pin space. Unlike other pinbots, this bot lets you set up rules that will allow it to mirror to and from as many channels as you desire.

## Current commands
- `help [command name]`: List all commands, or list information on a specific command
- `listrules [<channel name>]`: List all rules in the server, or list rules for a specific channel
- `add <channelFrom> <channelTo>`: Add a new pin mirroring rule
- `remove <channelFrom> <channelTo>`: Remove an existing pin mirroring rule
- `migrate [count]`: Migrate [count] pins from the current channel to each of its mirrors (default is 1)
- `migrateall`: Migrate all pins from the current channel
- `purge [count]`: Delete [count] messages from the current channel (default is 1)
- `setcooldown [seconds]`: Set the cooldown for Pinnerly Bot after each new pin (default is 0)

## Setup
Create a `config.json` file from the provided template and set `token` to a valid Discord bot token.

You can also change other options such as the activity status, command prefix, etc.
