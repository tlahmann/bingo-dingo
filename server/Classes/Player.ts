import * as uuid from 'node-uuid';
import * as WebSocket from 'ws'
import { HelperFunctions } from '../Modules/HelperFunctions';
import { PlayerRoles, pr } from './PlayerRoles'

export class Player {
    id: string;
    client: WebSocket
    remoteAddress: String
    nickname: string
    role: PlayerRoles
    joinedAt: number
    board: [{ number: number, isClicked: boolean }]
    lines: number[][]
    bingos: number

    constructor (ws: WebSocket, ra: String) {
        this.id = uuid.v4()
        this.client = ws
        this.remoteAddress = ra
        this.nickname = ''
        this.role = PlayerRoles.User
        this.joinedAt = new Date().getTime()
        this.board = HelperFunctions.getRandomGameBoard()
        this.lines = HelperFunctions.getLines()
        this.bingos = 0
    }

    setRole(role): void {
        this.role = role
    }

    isAdmin(): boolean {
        return this.role === PlayerRoles.Admin
    }

    shouldAuthenticate(): boolean {
        return this.role === PlayerRoles.Admin || this.role === PlayerRoles.Moderator
    }
}