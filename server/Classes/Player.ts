import { nosync } from "colyseus";
import * as uuid from 'node-uuid';
import { HelperFunctions } from '../Modules/HelperFunctions';
import { UserRoles, ur } from '../Classes/UserRoles'

export class Player {
  @nosync
  id: string;
  @nosync
  role: UserRoles;

  nickname: string;
  board: [{ number:number, isClicked:boolean }]
  lines: number[][]
  bingos: number

  constructor() {
    this.id = uuid.v4()
    this.nickname = ''
    this.role = UserRoles.User
    this.board = HelperFunctions.getRandomGameBoard()
    this.lines = HelperFunctions.getLines()
    this.bingos = 0
  }

  setRole(role): void {
    this.role = role
  }

  isAdmin(): boolean {
    return this.role === UserRoles.Admin
  }

  shouldAuthenticate(): boolean {
    return this.role === UserRoles.Admin || this.role === UserRoles.Moderator
  }
}
