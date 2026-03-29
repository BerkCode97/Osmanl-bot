// Komut: /yedek - Veritabanı Yedekle (SADECE OWNER)
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const config = require("../../config");
const { hataEmbed, basariEmbed } = require("../../events/yardimci");
const path = require("path");
const fs = require("fs");

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("yedek")
    .setDescription("Veritabanı yedeği al (SADECE BOT SAHİBİ)"),

  async execute(interaction) {
    // Sadece bot sahibi kullanabilir
    if (interaction.user.id !== config.OWNER_ID) {
      return interaction.reply({
        embeds: [hataEmbed("Bu komut yalnızca bot sahibi tarafından kullanılabilir!")],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const dbYolu = path.join(__dirname, "../../database/osmanli.db");

      if (!fs.existsSync(dbYolu)) {
        return interaction.editReply({ embeds: [hataEmbed("Veritabanı dosyası bulunamadı!")] });
      }

      const tarih = new Date().toISOString().replace(/[:.]/g, "-");
      const yedekAdi = `osmanli_yedek_${tarih}.db`;

      const dosya = new AttachmentBuilder(dbYolu, { name: yedekAdi });

      await interaction.editReply({
        embeds: [basariEmbed("✅ Yedek Alındı", `Veritabanı yedeği başarıyla oluşturuldu.\n**Dosya:** ${yedekAdi}`)],
        files: [dosya]
      });
    } catch (hata) {
      console.error("[HATA] Yedek alınamadı:", hata);
      return interaction.editReply({ embeds: [hataEmbed(`Yedek alınırken hata oluştu: ${hata.message}`)] });
    }
  },
};
