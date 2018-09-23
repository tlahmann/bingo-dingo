import { Room, EntityMap, Client, nosync } from "colyseus";
import { Player } from '../Classes/Player'
import { MessageHandler } from "../Classes/MessageHandler";

export class State {
    players: EntityMap<Player> = {};
    numbers: number[] = [];

    createPlayer(id: string) {
        this.players[id] = new Player();
    }

    removePlayer(id: string) {
        delete this.players[id];
    }

    clickPlayer(id: string, number: any) {
        let board = this.players[id].board;
        let n = parseInt(number);
        let indx = board.findIndex(f => f.number === n);
        board[indx].isClicked = true;
    }

    addNumber(num: number): void {
        this.numbers.push(num);
    }
}

export class BingoRoom extends Room<any> {
    messageHandler: MessageHandler
    maxClients = 500;

    onInit(options) {
        console.log("BingoRoom created!", options);
        this.setState(new State());
        this.messageHandler = new MessageHandler(this);
    }

    onJoin(client, options, auth) {
        console.log("BingoRoom:", client.sessionId, "joined!");
        this.state.createPlayer(client.sessionId);
    }

    requestJoin(options, isNewRoom: boolean) {
        return (options.create)
            ? (options.create && isNewRoom)
            : this.clients.length > 0;
    }

    onMessage(client, message) {
        this.messageHandler.handle(client, message);
    }

    onLeave(client) {
        console.log("BingoRoom:", client.sessionId, "left!");
        this.state.removePlayer(client.sessionId);
    }

    onDispose() {
        console.log("Dispose BingoRoom");
    }

}