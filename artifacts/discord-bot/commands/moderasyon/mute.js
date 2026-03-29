// Komut: /mute - Kullanıcı Susturma
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { basariEmbed, hataEmbed, bilgiEmbed, logGonder, dmGonder, sureFormatla, sureParseEt } = require("../../events/yardimci");
const { moderasyonLogEkle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Kullanıcıyı sustur (timeout)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Susturulacak kullanıcı").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sure").setDescription("Susturma süresi (örn: 30s, 5m, 2h, 1g)").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sebep").setDescription("Susturma sebebi").setRequired(false)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const sureMetin = interaction.options.getString("sure");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (hedef.id === interaction.user.id) return interaction.reply({ embeds: [hataEmbed("Kendinizi susturamazsınız!")], ephemeral: true });

    if (!hedef.moderatable) return interaction.reply({ embeds: [hataEmbed("Bu kullanıcıyı susturamam.")], ephemeral: true });

    const sureMs = sureParseEt(sureMetin);
    if (!sureMs || sureMs <= 0) {
      return interaction.reply({ embeds: [hataEmbed("Geçersiz süre! Örnek: `30s`, `5m`, `2sa`, `1g`")], ephemeral: true });
    }

    const maxSure = 28 * 24 * 60 * 60 * 1000; // 28 gün (Discord limiti)
    if (sureMs > maxSure) {
      return interaction.reply({ embeds: [hataEmbed("Maksimum susturma süresi 28 gündür!")], ephemeral: true });
    }

    const sureStr = sureFormatla(sureMs);

    const dmEmbed = bilgiEmbed(
      "🔇 Susturuldunuz",
      `**${interaction.guild.name}** sunucusunda **${sureStr}** süreyle susturuldunuz.`,
      [
        { name: "Sebep", value: sebep },
        { name: "Yetkili", value: interaction.user.tag }
      ]
    );
    await dmGonder(hedef.user, dmEmbed);

    await hedef.timeout(sureMs, `${interaction.user.tag}: ${sebep}`);

    moderasyonLogEkle(hedef.id, interaction.guild.id, interaction.user.id, "MUTE", sebep, sureMs);

    const logEmbed = basariEmbed(
      "🔇 Kullanıcı Susturuldu",
      `**${hedef.user.tag}** **${sureStr}** süreyle susturuldu.`,
      [
        { name: "Kullanıcı", value: `${hedef.user.tag} (${hedef.id})`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Süre", value: sureStr, inline: true },
        { name: "Sebep", value: sebep }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    return interaction.reply({
      embeds: [basariEmbed("✅ Kullanıcı Susturuldu", `**${hedef.user.tag}** **${sureStr}** süreyle susturuldu.`, [{ name: "Sebep", value: sebep }])]
    });
  },
};
