require("dotenv").config();

const MONGO_URI =
  process.env.NODE_ENV === "test"
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

const PORT = process.env.PORT;

module.exports = {MONGO_URI, PORT}