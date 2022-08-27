const {
    MessageEmbed,MessageAttachment
} = require("discord.js");
const profilManager = require("../../models/profilmanager")
const sunucuayar = require('../../models/sunucuayar');
const Stat = require("../../models/stats");
module.exports.run = async (client, message, args, durum, kanal) => {
	if (!message.guild) return;
    if (message.member.permissions.has(8) || durum) {
        let sec = args[0];
        let data = await sunucuayar.findOne({ guildID: message.guild.id });
        if (sec == "kanal") {
            let kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!kanal) return message.channel.send("Lütfen bir kanal belirleyiniz!");
            await sunucuayar.updateOne({ guildID: message.guild.id }, { $set: { [`levelSystem.voiceLog`]: kanal.id, }}, { upsert: true });
            return message.channel.send(`Başarılı bir şekilde ${kanal} kanalını voice LevelUp log kanalı olarak tanımladınız!`);
        };
        if (sec == "ekle") {
            let num = Number(args[1]);
            let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!num && !rol) return;
            await sunucuayar.updateOne({ guildID: message.guild.id }, { $set: { [`levelSystem.voice.${num}`]: rol.id, }}, { upsert: true });
            return message.channel.send(`${message.author}, başarılı bir şekilde ${rol} adlı rolü **${args[1]}** level olarak belirledin!`)
        };
        if (sec == "sil") {
            let num = Number(args[1]);
            if (!num) return;
            if (data.levelSystem.voice[num]) {
            await sunucuayar.updateOne({ guildID: message.guild.id }, { $unset: { [`levelSystem.voice.${num}`]: data.levelSystem.voice[num], }}, {upsert: true});
            } else return message.channel.send("Hata, lütfen geçerli bir level silmeyi deneyiniz!")
            return message.channel.send(`${message.author}, başarılı bir şekilde <@&${data.levelSystem.voice[num]}> adlı rolü level sisteminden kaldırdın!`)
        };
        let xpToNextLevel = (level) => { return 5 * Math.pow((level), 2) + 50 * (level) + 100 };
        if (sec == "liste") {
            let liste = Object.keys(data.levelSystem.voice).sort((a,b) => b-a);
            const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
            embed.setDescription(`
**${message.guild.name}** adlı sunucunun level listesi!

${liste.map(level => `**${level} Level**: <@&${data.levelSystem.voice[level]}> (XP: \`${xpToNextLevel(level)}\`)`).join("\n")}`)
            return message.channel.send(embed)
    };
  }
}
exports.conf = {
    aliases: []
}
exports.help = {
    name: 'level-rank-voice'
}