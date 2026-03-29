// Komut: /warnings - Uyarı Listesi
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { bilgiEmbed, hataEmbed } = require("../../events/yardimci");
const { uyarilariGetir } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Kullanıcının uyarılarını listele")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Uyarıları görülecek kullanıcı").setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getUser("kullanici");
    const uyarilar = uyarilariGetir(hedef.id, interaction.guild.id);

    if (uyarilar.length === 0) {
      return interaction.reply({ embeds: [bilgiEmbed("📋 Uyarı Listesi", `**${hedef.tag}** kullanıcısının hiç uyarısı yok.`)] });
    }

    const alanlar = uyarilar.slice(0, 10).map((u) => ({
      name: `Uyarı #${u.id}`,
      value: `**Sebep:** ${u.sebep}\n**Yetkili:** <@${u.moderator_id}>\n**Tarih:** <t:${u.tarih}:R>`,
      inline: false,
    }));

    return interaction.reply({
      embeds: [bilgiEmbed(
        `⚠️ ${hedef.tag} - Uyarı Listesi`,
        `Toplam **${uyarilar.length}** uyarı bulunuyor.`,
        alanlar
      )]
    });
  },
};
