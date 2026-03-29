// Komut: /kullanıcı-bilgi - Kullanıcı Detayı
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { bilgiEmbed } = require("../../events/yardimci");
const { kullaniciyiGetir, uyariSay } = require("../../database/database");
const { akceFormatla } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("kullanıcı-bilgi")
    .setDescription("Kullanıcı detaylarını gör")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Bilgileri görülecek kullanıcı").setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getMember("kullanici");
    if (!hedef) return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });

    const ekonomi = kullaniciyiGetir(hedef.id);
    const uyariSayisi = uyariSay(hedef.id, interaction.guild.id);

    const roller = hedef.roles.cache
      .filter((r) => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}>`)
      .slice(0, 5)
      .join(", ");

    return interaction.reply({
      embeds: [bilgiEmbed(
        `👤 ${hedef.user.tag}`,
        hedef.user.id,
        [
          { name: "📅 Hesap Oluşturma", value: `<t:${Math.floor(hedef.user.createdTimestamp / 1000)}:D>`, inline: true },
          { name: "📅 Sunucuya Katılma", value: hedef.joinedAt ? `<t:${Math.floor(hedef.joinedTimestamp / 1000)}:D>` : "Bilinmiyor", inline: true },
          { name: "🤖 Bot mu?", value: hedef.user.bot ? "Evet" : "Hayır", inline: true },
          { name: "⚠️ Uyarı Sayısı", value: `${uyariSayisi}`, inline: true },
          { name: "👝 Cüzdan", value: akceFormatla(ekonomi.cuzdan), inline: true },
          { name: "🏦 Banka", value: akceFormatla(ekonomi.banka), inline: true },
          { name: "🏷️ Roller", value: roller || "Yok" },
        ]
      ).setThumbnail(hedef.user.displayAvatarURL({ dynamic: true }))]
    });
  },
};
