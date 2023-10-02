const mongoose = require("mongoose");

const { Schema } = mongoose;

const cryptoPair = Schema({
  binance: {
    symbol: String,
    price: String,
  },
  bybit: {
    symbol: String,
    price: String,
  },
  date: String,
});

module.exports = mongoose.model("CryptoPair", cryptoPair);
