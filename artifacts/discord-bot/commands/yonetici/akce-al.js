// Komut: /akçe-al - Kullanıcıdan Akçe Al (Yönetici)
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, akceFormatla, logGonder } = require("../../events/yardimci");
const { cuzdanGuncelle, kullaniciyiGetir } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("akçe-al")
    .setDescription("Kullanıcıdan akçe al (YETKİ GEREKİR)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Akçesi alınacak kullanıcı").setRequired(true)
    )
    .addIntegerOption((secenek) =>
      secenek.setName("miktar").setDescription("Alınacak miktar").setRequired(true).setMinValue(1)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getUser("kullanici");
    const miktar = interaction.options.getInteger("miktar");
    const kullanici = kullaniciyiGetir(hedef.id);

    if (kullanici.cuzdan < miktar) {
      return interaction.reply({ embeds: [hataEmbed(`Kullanıcının cüzdanında yeterli akçe yok! Mevcut: ${akceFormatla(kullanici.cuzdan)}`)], ephemeral: true });
    }

    cuzdanGuncelle(hedef.id, -miktar);

    const logEmbed = basariEmbed(
      "👑 Yönetici Akçe Aldı",
      `**${interaction.user.tag}** ← **${hedef.tag}** akçe alındı`,
      [
        { name: "Miktar", value: akceFormatla(miktar), inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true }
      ]
    );
    await logGonder(client, interaction.guild.id, "YONETICI", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Akçe Alındı",
        `**${hedef.username}**'den **${akceFormatla(miktar)}** alındı.`,
        [{ name: "Kalan Bakiye", value: akceFormatla(kullanici.cuzdan - miktar) }]
      )]
    });
  },
};
