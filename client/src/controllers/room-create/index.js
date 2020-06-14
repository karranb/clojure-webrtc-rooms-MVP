import { TITLES } from '_constants'
import CreateRoomScreen from '_views/create-room'

import Room from '_models/room'

const CreateRoomController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const createRoom = (name, size) => {
    const data = { title: TITLES.CREATE_ROOM, name, size }
    sendSocketMessage(data)
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    if (parsedData.title === TITLES.CREATE_ROOM) {
      stateManager.updateUser(user => user.setIsHost(true))
      const user = stateManager.getUser()
      stateManager.setRoom(
        Room({
          roomId: parsedData.id,
          name: parsedData.name,
          users: { [user.getId()]: user },
          size: parsedData.size,
          isHost: true,
          sendSocketMessage,
        })
      )
      stateManager.webStateMachineSend('CREATE')
    }
  }

  setSocketListener(onMessage)
  CreateRoomScreen({ $game, createRoom, stateManager })
}

export default CreateRoomController
