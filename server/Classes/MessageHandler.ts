'use strict'

import { Room } from "colyseus";
import { Protocol } from './Protocol'
// import hf from '../Modules/HelperFunctions'

export class MessageHandler {
    room: Room

    constructor(room: Room) {
        this.room = room;
    }

    handle(client, message): void {
        if (!message.data) return;
        switch (message.type) {
            case Protocol.MESSAGE_NUMBER:
                this.handleClick(client, message.data);
                break;
            case Protocol.MESSAGE_NUMBER:
                this.handleNumber(message.data);
                break;
            default:
                console.log(message);
                break;
        }
    }

    handleClick(client, data): void {
        this.room.state.clickPlayer(client.sessionId, data.number);
    }

    handleNumber(data): void {
        console.log(data);
        this.room.state.addNumber(data.number);
        /* db.findUser(me.nickname).then(user => {
            if (user && user.role === 'admin') {
                let n = {
                    id: uuid.v4(),
                    timestamp: new Date().getTime(),
                    number: hf.sanitize(decoded.message)
                }

                // Store the number
                db.insertNumber(session, n)
                gm.numbers.push(n) */

        // and broadcast it to all players
        // this.broadcast(Protocol.MESSAGE_NUMBER, data.number)
        /* }
    }).catch(err => console.log(err)) */
    }

    /* selectiveBroadcast(fn, type, msg) {
        this.gm.users
            .filter(u => fn(u))
            .map(user => this.sendPacket(user.client, type, msg))
    } */

    broadcast(type, data) {
        this.room.broadcast({
            type: type,
            data: data
        });
    }
}