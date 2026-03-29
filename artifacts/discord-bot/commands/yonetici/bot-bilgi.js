// Komut: /bot-bilgi - Bot Bilgisi
const { SlashCommandBuilder, version: djsVersion } = require("discord.js");
const { bilgiEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("bot-bilgi")
    .setDescription("Bot hakkında bilgi al"),

  async execute(interaction, client) {
    const uptime = process.uptime();
    const saat = Math.floor(uptime / 3600);
    const dakika = Math.floor((uptime % 3600) / 60);
    const saniye = Math.floor(uptime % 60);

    const bellek = process.memoryUsage();

    return interaction.reply({
      embeds: [bilgiEmbed(
        "👑 Osmanlı Bot Bilgisi",
        "Devlet-i Aliyye-i Osmaniyye'nin resmi Discord botu",
        [
          { name: "🤖 Bot Adı", value: client.user.tag, inline: true },
          { name: "📡 Ping", value: `${client.ws.ping}ms`, inline: true },
          { name: "⚙️ Discord.js", value: `v${djsVersion}`, inline: true },
          { name: "🟢 Node.js", value: process.version, inline: true },
          { name: "⏰ Çalışma Süresi", value: `${saat}sa ${dakika}dk ${saniye}s`, inline: true },
          { name: "💾 Bellek", value: `${Math.round(bellek.heapUsed / 1024 / 1024)}MB`, inline: true },
          { name: "🌐 Sunucu Sayısı", value: `${client.guilds.cache.size}`, inline: true },
          { name: "📝 Komut Sayısı", value: `${client.commands.size}`, inline: true },
        ]
      ).setThumbnail(client.user.displayAvatarURL({ dynamic: true }))]
    });
  },
};
