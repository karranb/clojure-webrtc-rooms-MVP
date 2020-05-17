import { interpret } from 'xstate'

import WebStateMachine from './web-state-machine'

import Room from '_models/room'
import Socket from '_models/socket'
import User from '_models/user'


const Controller = ({ $game }) => {
  let state = {
    user: User(),
    room: Room(),
    webStateMachine: null,
  }

  const { sendMessage: sendSocketMessage, setListener: setSocketListener } = Socket()

  const stateManager = {
    setUser: user => {
      state.user = user 
    },
    updateUser: fn => {
      state.user = fn(state.user)
    },
    getUser: () => state.user,
    setRoom: room => {
      state.room = room
    },
    updateRoom: fn => {
      state.room = fn(state.room)
    },
    getRoom: () => state.room,
    setWebStateMachine: webStateMachine => {
      state.webStateMachine = webStateMachine
    },
    webStateMachineSend: type => {
      state.webStateMachine.send(type)
    },
  }

  stateManager.setWebStateMachine(interpret(
    WebStateMachine({ sendSocketMessage, setSocketListener, $game, stateManager })
  ).start())

}

export default Controller
