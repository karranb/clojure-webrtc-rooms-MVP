import { TITLES } from '_constants'
import CreateRoomScreen from '_views/create-room'

import Room from '_models/room'

const CreateRoomController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const createRoom = name => {
    const data = { title: TITLES.CREATE_ROOM, name }
    sendSocketMessage(data)
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CREATE_ROOM:
        stateManager.updateUser(user => user.setIsHost(true))
        stateManager.setRoom(Room({ roomId: parsedData.id, name: parsedData.name, host: stateManager.getUser() }))
        stateManager.webStateMachineSend('CREATE')
        return
    }
  }

  setSocketListener(onMessage)
  CreateRoomScreen({ $game, createRoom })
}

export default CreateRoomController
