import Controller from "./controllers"
import { GAME_DIV_ID } from "./constants"

const $game =  document.querySelector(GAME_DIV_ID)

Controller({ $game })
