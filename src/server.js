require("dotenv").config();
const express = require("express");
const http = require("http");
const initSocket = require("./websocket/socket");

const app = express();
const server = http.createServer(app);

initSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.PORT}`);
});
