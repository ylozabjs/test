const CronJob = require("node-cron");
const CryptoPair = require("../models/CryptoPair");

const initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("*/5 * * * * *", async () => {
    console.log("cron called");

    const results = await Promise.all([
      fetch(process.env.BINANCE_PRICE_URL),
      fetch(process.env.BYBIT_PRICE_URL),
    ]);

    const [binanceText, bybitText] = await Promise.all(
      results.map((x) => x.json())
    );

    const pair = new CryptoPair({
      binance: binanceText,
      bybit: {
        symbol: bybitText.result.symbol,
        price: bybitText.result.list[0][4],
      },
      date: new Date(),
    });

    pair.save();
  });

  scheduledJobFunction.start();
};

module.exports = initScheduledJobs;
