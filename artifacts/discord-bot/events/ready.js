// Event: Bot Hazır
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`[READY] Bot hazır: ${client.user.tag}`);
  },
};
