// Komut: /warn - Uyarı Verme (Otomatik mute/ban sistemi dahil)
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../config");
const { basariEmbed, hataEmbed, bilgiEmbed, logGonder, dmGonder, sureFormatla } = require("../../events/yardimci");
const { uyariEkle, uyariSay, moderasyonLogEkle } = require("../../database/database");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Kullanıcıya uyarı ver")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((secenek) =>
      secenek.setName("kullanici").setDescription("Uyarılacak kullanıcı").setRequired(true)
    )
    .addStringOption((secenek) =>
      secenek.setName("sebep").setDescription("Uyarı sebebi").setRequired(true)
    ),

  async execute(interaction, client) {
    const hedef = interaction.options.getMember("kullanici");
    const sebep = interaction.options.getString("sebep");

    if (!hedef) return interaction.reply({ embeds: [hataEmbed("Kullanıcı bulunamadı.")], ephemeral: true });
    if (hedef.id === interaction.user.id) return interaction.reply({ embeds: [hataEmbed("Kendinize uyarı veremezsiniz!")], ephemeral: true });
    if (hedef.user.bot) return interaction.reply({ embeds: [hataEmbed("Botlara uyarı veremezsiniz!")], ephemeral: true });

    // Uyarı ekle
    const uyariId = uyariEkle(hedef.id, interaction.guild.id, interaction.user.id, sebep);
    const toplamUyari = uyariSay(hedef.id, interaction.guild.id);

    // DM gönder
    const dmEmbed = bilgiEmbed(
      "⚠️ Uyarı Aldınız",
      `**${interaction.guild.name}** sunucusunda uyarı aldınız.`,
      [
        { name: "Sebep", value: sebep },
        { name: "Uyarı No", value: `#${uyariId}`, inline: true },
        { name: "Toplam Uyarı", value: `${toplamUyari}`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true }
      ]
    );
    await dmGonder(hedef.user, dmEmbed);

    // Log kaydı
    moderasyonLogEkle(hedef.id, interaction.guild.id, interaction.user.id, "WARN", sebep);

    const logEmbed = basariEmbed(
      "⚠️ Uyarı Verildi",
      `**${hedef.user.tag}** kullanıcısına uyarı verildi.`,
      [
        { name: "Kullanıcı", value: `${hedef.user.tag} (${hedef.id})`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Uyarı No", value: `#${uyariId}`, inline: true },
        { name: "Toplam Uyarı", value: `${toplamUyari}`, inline: true },
        { name: "Sebep", value: sebep }
      ]
    );
    await logGonder(client, interaction.guild.id, "MODERASYON", logEmbed);

    // Uyarı eşiklerini kontrol et
    let otomatikIslem = "";

    if (toplamUyari >= config.MODERASYON.UYARI_BAN_ESIK) {
      // Otomatik ban
      try {
        const banDmEmbed = hataEmbed(
          `**${interaction.guild.name}** sunucusundan otomatik olarak banlandınız!\n` +
          `Sebep: ${config.MODERASYON.UYARI_BAN_ESIK} uyarı limitine ulaşıldı.`
        );
        await dmGonder(hedef.user, banDmEmbed);
        await hedef.ban({ reason: `Otomatik ban: ${toplamUyari} uyarı limitine ulaşıldı` });
        moderasyonLogEkle(hedef.id, interaction.guild.id, client.user.id, "OTOMATIK_BAN", `${toplamUyari} uyarı`);
        otomatikIslem = `\n🔨 **Otomatik BAN uygulandı!** (${toplamUyari} uyarı)`;
      } catch (hata) {
        console.error("[HATA] Otomatik ban uygulanamadı:", hata.message);
      }
    } else if (toplamUyari >= config.MODERASYON.UYARI_MUTE_ESIK && hedef.moderatable) {
      // Otomatik mute
      try {
        const suteSure = config.MODERASYON.OTOMATIK_MUTE_SURE;
        await hedef.timeout(suteSure, `Otomatik mute: ${toplamUyari} uyarı`);
        moderasyonLogEkle(hedef.id, interaction.guild.id, client.user.id, "OTOMATIK_MUTE", `${toplamUyari} uyarı`, suteSure);
        otomatikIslem = `\n🔇 **Otomatik MUTE uygulandı!** ${sureFormatla(suteSure)} süreyle. (${toplamUyari} uyarı)`;
      } catch (hata) {
        console.error("[HATA] Otomatik mute uygulanamadı:", hata.message);
      }
    }

    return interaction.reply({
      embeds: [basariEmbed(
        "✅ Uyarı Verildi",
        `**${hedef.user.tag}** kullanıcısına uyarı verildi.${otomatikIslem}`,
        [
          { name: "Sebep", value: sebep },
          { name: "Toplam Uyarı", value: `${toplamUyari}`, inline: true },
          { name: "Uyarı No", value: `#${uyariId}`, inline: true }
        ]
      )]
    });
  },
};
