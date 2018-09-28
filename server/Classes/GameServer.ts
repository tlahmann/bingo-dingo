'use strict'

// import * as DataBaser from './DataBaser'
import { GameManager } from './GameManager'
import { MessageHandler } from './MessageHandler'
import { HelperFunctions } from '../Modules/HelperFunctions'
import * as path from 'path'
import { appendLine, getLastLine } from '../Modules/fileTools'
import { v4 as uuid } from 'node-uuid'
import { Player } from './Player'
import { Protocol } from '../protocol'
import { PathLike } from 'fs';

// Parameters
const dataBaseURL: String = 'mongodb://localhost:27017/'
const fileName: PathLike = path.join(__dirname, '../session.txt')

export class GameServer {
    // Static fields
    public static gameManager: GameManager = new GameManager()
    // public static dataBaser: DataBaser = new DataBaser(dataBaseURL)
    public static messageHandler: MessageHandler = new MessageHandler()

    session: String = ''

    constructor () {
    }

    loadSession(): void {
        getLastLine(fileName, 1)
            .then((lastLine) => {
                this.session = lastLine
                console.log(`# ${ HelperFunctions.formatDate(new Date()) }: Server started with an existing session: ${ this.session }`)
            })
            .catch((err) => {
                console.error(err)
                this.startSession()
            })
    }

    startSession(): void {
        this.session = uuid()
        appendLine(fileName, this.session)
        console.log(`# ${ HelperFunctions.formatDate(new Date()) }: Server started a new session: ${ this.session }`)
    }

    addPlayer(player: Player): void {
        GameServer.gameManager.addDummyUser(player)

        GameServer.messageHandler.broadcast(
            Protocol.MESSAGE_USER_JOINS,
            {
                id: player.id,
                nickname: player.nickname,
                joinedAt: player.joinedAt
            })
    }

    removePlayer(player: Player): void {
        GameServer.gameManager.removeSocket(player.client)
        GameServer.messageHandler.broadcast(Protocol.MESSAGE_USER_LEAVES, { id: player.id })
    }

    checkPlayer(player: Player, req: any): void {
        let userAllowed = GameServer.gameManager.checkUser(req)
        /// Either reject the player when too many connections are open or the IP is banned, or ask for the players name
        if (userAllowed) {
            let message = {
                id: uuid(),
                timestamp: new Date().getTime(),
                message: userAllowed
            }
            GameServer.messageHandler.sendPacket(player.client, Protocol.MESSAGE_SERVER_REJECT, message)
            player.client.close()
        } else {
            GameServer.messageHandler.sendPacket(player.client, Protocol.MESSAGE_WHO_ARE_YOU, null)
            GameServer.messageHandler.sendUserList(player.client)
            GameServer.messageHandler.sendHistory(player.client, this.session)
        }
    }
}
