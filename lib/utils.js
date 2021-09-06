// TODO: Multiple images are actually stored in multiple embeds, not just the first
module.exports = {
    createEmbedFromPin(pinMsg) {
        let user = pinMsg.member || pinMsg.author;
        let img = pinMsg.attachments.first()?.url;
        
        if (!img) {
            let embed = pinMsg.embeds.shift();
            img = embed?.image.url || embed?.thumbnail.url;
        }

        let pinEmbed = {
            author: {
                name: user.displayName || user.username,
                icon_url: user.user?.displayAvatarURL() || user.displayAvatarURL()
            },
            color: user.displayColor,
            title: `New message pinned in ${pinMsg.channel.name}!`,
            url: pinMsg.url,
            description: pinMsg.cleanContent,
            image: {url: img},
            timestamp: pinMsg.createdTimestamp
        };

        return pinEmbed;
    }
}