import * as path from 'path';
import * as express from 'express';
import * as serveIndex from 'serve-index';
import { createServer } from 'http';
import { Server } from 'colyseus';
import { HelperFunctions } from './Modules/HelperFunctions';

// Import room handlers
import { BingoRoom } from "./rooms/bingoroom";

const port = Number(process.env.PORT || 8080);
const app = express();

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app)
});

// Register BingoRoom as "bingo"
gameServer.register("bingo", BingoRoom);

app.use('/', express.static(path.join(__dirname, "static")));
app.use('/', serveIndex(path.join(__dirname, "static"), { 'icons': true }))

gameServer.onShutdown(function () {
  console.log(`game server is going down.`);
});

gameServer.listen(port);
console.log(`${HelperFunctions.formatDate(new Date())} Listening on ws://localhost:${port}`);
