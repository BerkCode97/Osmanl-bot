// Komut: /sunucu-bilgi - Sunucu İstatistikleri
const { SlashCommandBuilder } = require("discord.js");
const { bilgiEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("sunucu-bilgi")
    .setDescription("Sunucu istatistiklerini gör"),

  async execute(interaction) {
    const guild = interaction.guild;

    await guild.members.fetch();

    const toplamUye = guild.memberCount;
    const botlar = guild.members.cache.filter((m) => m.user.bot).size;
    const insanlar = toplamUye - botlar;
    const cevrimici = guild.members.cache.filter((m) => !m.user.bot && m.presence?.status !== "offline").size;

    const kanallar = guild.channels.cache;
    const metinKanal = kanallar.filter((k) => k.type === 0).size;
    const sesKanal = kanallar.filter((k) => k.type === 2).size;

    const olusturmaTarih = Math.floor(guild.createdTimestamp / 1000);

    return interaction.reply({
      embeds: [bilgiEmbed(
        `🏛️ ${guild.name}`,
        guild.description || "Osmanlı İmparatorluğu sunucusu",
        [
          { name: "👑 Sahip", value: `<@${guild.ownerId}>`, inline: true },
          { name: "📅 Kuruluş", value: `<t:${olusturmaTarih}:D>`, inline: true },
          { name: "🌍 Bölge", value: guild.preferredLocale, inline: true },
          { name: "👥 Üyeler", value: `${toplamUye} toplam`, inline: true },
          { name: "👤 İnsanlar", value: `${insanlar}`, inline: true },
          { name: "🤖 Botlar", value: `${botlar}`, inline: true },
          { name: "💬 Metin Kanalları", value: `${metinKanal}`, inline: true },
          { name: "🔊 Ses Kanalları", value: `${sesKanal}`, inline: true },
          { name: "🏷️ Roller", value: `${guild.roles.cache.size}`, inline: true },
          { name: "😀 Emojiler", value: `${guild.emojis.cache.size}`, inline: true },
          { name: "🚀 Boost", value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
          { name: "⭐ Boost Seviyesi", value: `${guild.premiumTier}`, inline: true },
        ]
      ).setThumbnail(guild.iconURL({ dynamic: true }))]
    });
  },
};
