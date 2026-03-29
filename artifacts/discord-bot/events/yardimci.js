// Osmanlı Bot - Yardımcı Fonksiyonlar
const { EmbedBuilder } = require("discord.js");
const config = require("../config");
const { logKanaliniGetir } = require("../database/database");

// --- EMBED OLUŞTURUCULAR ---

function basariEmbed(baslik, aciklama, alanlar = []) {
  const embed = new EmbedBuilder()
    .setColor(config.RENK_BASARI)
    .setTitle(baslik)
    .setDescription(aciklama)
    .setFooter({ text: config.FOOTER })
    .setTimestamp();

  for (const alan of alanlar) {
    embed.addFields(alan);
  }
  return embed;
}

function hataEmbed(aciklama) {
  return new EmbedBuilder()
    .setColor(config.RENK_HATA)
    .setDescription(`❌ ${aciklama}`)
    .setFooter({ text: config.FOOTER })
    .setTimestamp();
}

function bilgiEmbed(baslik, aciklama, alanlar = []) {
  const embed = new EmbedBuilder()
    .setColor(config.RENK_ANA)
    .setTitle(baslik)
    .setDescription(aciklama)
    .setFooter({ text: config.FOOTER })
    .setTimestamp();

  for (const alan of alanlar) {
    embed.addFields(alan);
  }
  return embed;
}

function altinEmbed(baslik, aciklama, alanlar = []) {
  const embed = new EmbedBuilder()
    .setColor(config.RENK_ALTIN)
    .setTitle(baslik)
    .setDescription(aciklama)
    .setFooter({ text: config.FOOTER })
    .setTimestamp();

  for (const alan of alanlar) {
    embed.addFields(alan);
  }
  return embed;
}

// --- LOG SİSTEMİ ---

async function logGonder(client, guildId, kanalTur, embed) {
  try {
    const kanalId = logKanaliniGetir(guildId, kanalTur);
    if (!kanalId) return;

    const kanal = await client.channels.fetch(kanalId).catch(() => null);
    if (!kanal) return;

    await kanal.send({ embeds: [embed] });
  } catch (hata) {
    console.error(`[LOG HATA] ${kanalTur} kanalına log gönderilemedi:`, hata.message);
  }
}

// --- SÜRE FORMATLAMA ---

function sureFormatla(ms) {
  const saniye = Math.floor(ms / 1000);
  const dakika = Math.floor(saniye / 60);
  const saat = Math.floor(dakika / 60);
  const gun = Math.floor(saat / 24);

  if (gun > 0) return `${gun} gün ${saat % 24} saat`;
  if (saat > 0) return `${saat} saat ${dakika % 60} dakika`;
  if (dakika > 0) return `${dakika} dakika ${saniye % 60} saniye`;
  return `${saniye} saniye`;
}

function kalansureFormatla(ms) {
  if (ms <= 0) return "0 saniye";
  return sureFormatla(ms);
}

// --- SÜRE PARSE (kullanıcı girdisi: 1h30m, 2s vs.) ---

function sureParseEt(metin) {
  const regex = /(\d+)\s*(s(?:an(?:iye)?)?|d(?:ak(?:ika)?)?|sa(?:at)?|g(?:ün?)?|w(?:eek)?|h(?:our)?|m(?:in(?:ute)?)?)/gi;
  let toplam = 0;
  let eslesme;

  while ((eslesme = regex.exec(metin)) !== null) {
    const deger = parseInt(eslesme[1]);
    const birim = eslesme[2].toLowerCase();

    if (birim.startsWith("s")) toplam += deger * 1000;
    else if (birim.startsWith("d") || birim.startsWith("m")) toplam += deger * 60 * 1000;
    else if (birim.startsWith("sa") || birim.startsWith("h")) toplam += deger * 60 * 60 * 1000;
    else if (birim.startsWith("g") || birim.startsWith("w")) toplam += deger * 24 * 60 * 60 * 1000;
  }

  return toplam;
}

// --- YETKİ KONTROLÜ ---

function yoneticiMi(member) {
  return member.permissions.has("Administrator") || member.permissions.has("ManageGuild");
}

function moderatorMu(member) {
  return (
    member.permissions.has("BanMembers") ||
    member.permissions.has("KickMembers") ||
    member.permissions.has("ModerateMembers") ||
    yoneticiMi(member)
  );
}

// --- SAYI FORMATLAMA ---

function sayiFormatla(sayi) {
  return Number(sayi).toLocaleString("tr-TR");
}

function akceFormatla(miktar) {
  return `${sayiFormatla(miktar)} ${config.AKCE_EMOJI}`;
}

// --- KULLANICI BİLGİSİ GETIR ---

async function kullaniciBilgisiGetir(client, userId) {
  try {
    return await client.users.fetch(userId);
  } catch {
    return null;
  }
}

// --- DM GÖNDER ---

async function dmGonder(kullanici, embed) {
  try {
    await kullanici.send({ embeds: [embed] });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  basariEmbed,
  hataEmbed,
  bilgiEmbed,
  altinEmbed,
  logGonder,
  sureFormatla,
  kalansureFormatla,
  sureParseEt,
  yoneticiMi,
  moderatorMu,
  sayiFormatla,
  akceFormatla,
  kullaniciBilgisiGetir,
  dmGonder,
};
