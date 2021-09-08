// TODO: Multiple images are actually stored in multiple embeds, not just the first
module.exports = {
    createEmbedsFromPin(pinMsg) {
        // NB: A single embed supports up to 4 image previews
        let EMBEDS_OPEN = 4;

        let user = pinMsg.member || pinMsg.author;
        // Check for image attachments
        let imgs = pinMsg.attachments
            .filter(attach => attach.contentType?.includes("image"))
            .first(EMBEDS_OPEN)
            .map(attach => attach.url);

        // Check for image previews in embed if we have room for more
        if (imgs.length < EMBEDS_OPEN) {
            let embeds = pinMsg.embeds
                .filter(embed => embed.image || embed.thumbnail)
                .slice(0, EMBEDS_OPEN - imgs.length)
                .map(embed => embed.image?.url || embed.thumbnail?.url);
            imgs.push(...embeds);
        }

        // Images are stored in multiple embeds and consolidated server-side
        // Subsequent embeds must have: (a) a URL matching the first embed; (b) an image
        return [
            {
                color: user.displayColor,
                author: {
                    name: user.displayName || user.username,
                    icon_url: user.user?.displayAvatarURL() || user.displayAvatarURL()
                },
                title: `New message pinned in ${pinMsg.channel.name}!`,
                url: pinMsg.url,
                description: pinMsg.cleanContent,
                image: {url: imgs.shift()},
                footer: {text: pinMsg.channel.name},
                timestamp: pinMsg.createdTimestamp
            },
            ...imgs.map(imgUrl => ({
                url: pinMsg.url,
                image: {url: imgUrl}
            }))
        ];
    }
}