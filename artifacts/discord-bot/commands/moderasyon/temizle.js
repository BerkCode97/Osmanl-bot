// Komut: /temizle - Mesaj Silme
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed } = require("../../events/yardimci");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("temizle")
    .setDescription("Kanaldan mesaj sil (1-100)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((secenek) =>
      secenek
        .setName("sayi")
        .setDescription("Silinecek mesaj sayısı")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const sayi = interaction.options.getInteger("sayi");

    await interaction.deferReply({ ephemeral: true });

    try {
      const silinenler = await interaction.channel.bulkDelete(sayi, true);
      return interaction.editReply({
        embeds: [basariEmbed("✅ Mesajlar Temizlendi", `**${silinenler.size}** mesaj başarıyla silindi.`)]
      });
    } catch (hata) {
      console.error("[HATA] Mesajlar silinemedi:", hata.message);
      return interaction.editReply({ embeds: [hataEmbed("Mesajlar silinirken hata oluştu. 14 günden eski mesajlar silinemez.")] });
    }
  },
};
