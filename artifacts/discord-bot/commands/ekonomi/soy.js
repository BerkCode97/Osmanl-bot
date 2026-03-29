// Komut: /soy - Soygun Dene
const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, bilgiEmbed, akceFormatla, kalansureFormatla, logGonder } = require("../../events/yardimci");
const { kullaniciyiGetir, cuzdanGuncelle, soygonSonGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("soy")
    .setDescription("Birini soymayı dene (%40 başarı)")
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Soyulacak kullanıcı").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getUser("kullanici");

    if (hedef.id === interaction.user.id) return interaction.reply({ embeds: [hataEmbed("Kendinizi soyamazsınız!")], ephemeral: true });
    if (hedef.bot) return interaction.reply({ embeds: [hataEmbed("Botları soyamazsınız!")], ephemeral: true });

    const soyucu = kullaniciyiGetir(interaction.user.id);
    const kurbanlKullanici = kullaniciyiGetir(hedef.id);

    const simdi = Date.now();
    const kalan = soyucu.soygun_son + config.EKONOMI.SOYGUN_COOLDOWN - simdi;

    if (kalan > 0) {
      return interaction.reply({ embeds: [hataEmbed(`Soygundan kaçıyorsunuz! **${kalansureFormatla(kalan)}** sonra tekrar deneyin.`)], ephemeral: true });
    }

    if (kurbanlKullanici.cuzdan < config.EKONOMI.SOYGUN_MIN) {
      return interaction.reply({ embeds: [hataEmbed("Hedefin cüzdanında çok az akçe var, değmez!")], ephemeral: true });
    }

    soygonSonGuncelle(interaction.user.id);

    const basarili = Math.random() < config.EKONOMI.SOYGUN_BASARI;

    if (basarili) {
      // Başarılı soygun: hedefin cüzdanının %10-30'unu al
      const oran = Math.random() * 0.2 + 0.1;
      const miktar = Math.floor(kurbanlKullanici.cuzdan * oran);
      const gercekMiktar = Math.max(config.EKONOMI.SOYGUN_MIN, Math.min(miktar, 1000));

      cuzdanGuncelle(hedef.id, -gercekMiktar);
      cuzdanGuncelle(interaction.user.id, gercekMiktar);

      const logEmbed = basariEmbed(
        "🗡️ Soygun",
        `**${interaction.user.tag}** → **${hedef.tag}** soygunu`,
        [{ name: "Miktar", value: akceFormatla(gercekMiktar) }]
      );
      await logGonder(client, interaction.guild.id, "EKONOMI", logEmbed);

      return interaction.reply({
        embeds: [basariEmbed(
          "🗡️ Soygun Başarılı!",
          `**${hedef.username}**'i soydunuz! Kaçmayı başardınız.`,
          [
            { name: "Kazanılan", value: akceFormatla(gercekMiktar), inline: true },
            { name: "Yeni Bakiye", value: akceFormatla(soyucu.cuzdan + gercekMiktar), inline: true }
          ]
        )]
      });
    } else {
      // Başarısız soygun: ceza öde
      const cezaMiktari = Math.floor(soyucu.cuzdan * config.EKONOMI.SOYGUN_CEZA_ORANI);
      const gercekCeza = Math.min(cezaMiktari, soyucu.cuzdan);

      if (gercekCeza > 0) cuzdanGuncelle(interaction.user.id, -gercekCeza);

      return interaction.reply({
        embeds: [bilgiEmbed(
          "👮 Soygun Başarısız!",
          `Yakalandınız! Yeniçeriler sizi zindana attı ve ceza ödettirdi.`,
          [
            { name: "Ceza", value: akceFormatla(gercekCeza), inline: true },
            { name: "Yeni Bakiye", value: akceFormatla(soyucu.cuzdan - gercekCeza), inline: true }
          ]
        )]
      });
    }
  },
};
