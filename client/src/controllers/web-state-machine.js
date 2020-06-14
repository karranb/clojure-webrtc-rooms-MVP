import { Machine } from 'xstate'
import { innerHTML } from '_utils'

import CreateRoomController from './room-create'
import RoomListController from './room-list'
import RoomController from './room'
import SigninController from './signin'

const WebStateMachine = ({ sendSocketMessage, setSocketListener, $game, stateManager }) => {
  const clear = () => innerHTML('', $game)

  const controllersArgs = { $game, stateManager, sendSocketMessage, setSocketListener }

  return Machine({
    initial: 'nameScreen',
    states: {
      nameScreen: {
        on: { CONFIRM: 'roomsListScreen' },
        entry: [() => SigninController(controllersArgs)],
        exit: [clear],
      },
      roomsListScreen: {
        on: {
          CREATE: 'roomCreateScreen',
          JOIN: 'roomScreen',
        },
        entry: [() => RoomListController(controllersArgs)],
        exit: [clear],
      },
      roomCreateScreen: {
        on: {
          CLOSE: 'roomsListScreen',
          CREATE: 'roomScreen',
        },
        entry: [() => CreateRoomController(controllersArgs)],
        exit: [clear],
      },
      roomScreen: {
        on: {
          CLOSE: 'roomsListScreen',
        },
        entry: [() => RoomController(controllersArgs)],
        exit: [clear],
      },
    },
  })
}

export default WebStateMachine
