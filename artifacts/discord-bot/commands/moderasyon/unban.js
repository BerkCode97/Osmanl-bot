// Komut: /unban - Ban Kaldırma
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, logGonder } = require("../../events/yardimci");
const { moderasyonLogEkle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Kullanıcının banını kaldır")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((secenek) =>
      secenek.setName("kullanici_id").setDescription("Banı kaldırılacak kullanıcı ID'si").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sebep").setDescription("Unban sebebi").setRequired(false)
    ),

  async execute(interaction, client) {
    const kullaniciId = interaction.options.getString("kullanici_id");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    let kullanici;
    try {
      kullanici = await client.users.fetch(kullaniciId);
    } catch {
      return interaction.reply({ embeds: [hataEmbed("Geçersiz kullanıcı ID'si!")], ephemeral: true });
    }

    const banKontrol = await interaction.guild.bans.fetch(kullaniciId).catch(() => null);
    if (!banKontrol) {
      return interaction.reply({ embeds: [hataEmbed("Bu kullanıcı zaten banlanmamış!")], ephemeral: true });
    }

    await interaction.guild.bans.remove(kullaniciId, `${interaction.user.tag}: ${sebep}`);

    moderasyonLogEkle(kullaniciId, interaction.guild.id, interaction.user.id, "UNBAN", sebep);

    const logEmbed = basariEmbed(
      "✅ Ban Kaldırıldı",
      `**${kullanici.tag}** kullanıcısının banı kaldırıldı.`,
      [
        { name: "Kullanıcı", value: `${kullanici.tag} (${kullaniciId})`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: sebep }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    return interaction.reply({ embeds: [basariEmbed("✅ Ban Kaldırıldı", `**${kullanici.tag}** kullanıcısının banı kaldırıldı.`)] });
  },
};
