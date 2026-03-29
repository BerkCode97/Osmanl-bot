// Komut: /vergi-öde - Vergi Öde
const { SlashCommandBuilder } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla, logGonder } = require("../../events/yardimci");
const { vergiyiGetir, kullaniciyiGetir, vergiOde, cuzdanGuncelle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("vergi-öde")
    .setDescription("Haftalık vergiyi öde"),

  async execute(interaction, client) {
    const vergi = vergiyiGetir(interaction.user.id, interaction.guild.id);
    const kullanici = kullaniciyiGetir(interaction.user.id);

    if (vergi.borclu <= 0) {
      return interaction.reply({ embeds: [basariEmbed("✅ Vergi Durumu", "Devlet-i Aliyye'ye herhangi bir vergi borcunuz bulunmamaktadır.")] });
    }

    const odenecek = vergi.borclu;

    if (kullanici.cuzdan < odenecek) {
      return interaction.reply({ embeds: [hataEmbed(`Yeterli akçeniz yok! Borcunuz: ${akceFormatla(odenecek)}, Cüzdanınız: ${akceFormatla(kullanici.cuzdan)}`)], ephemeral: true });
    }

    cuzdanGuncelle(interaction.user.id, -odenecek);
    vergiOde(interaction.user.id, interaction.guild.id, odenecek);

    const logEmbed = basariEmbed(
      "💰 Vergi Ödendi",
      `**${interaction.user.tag}** vergisini ödedi.`,
      [{ name: "Miktar", value: akceFormatla(odenecek) }]
    );
    await logGonder(client, interaction.guild.id, "EKONOMI", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Vergi Ödendi",
        `**${akceFormatla(odenecek)}** vergi ödemesi yapıldı. Devlet-i Aliyye size minnettardır!`,
        [{ name: "Yeni Cüzdan Bakiyesi", value: akceFormatla(kullanici.cuzdan - odenecek) }]
      )]
    });
  },
};
