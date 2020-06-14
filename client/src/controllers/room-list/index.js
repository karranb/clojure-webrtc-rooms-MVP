import Room from '_models/room'
import { TITLES } from '_constants'
import RoomListScreen, { RoomItem } from '_views/room-list'
import { appendChildren, innerHTML } from '_utils'

const RoomListController = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const sendGetRoom = () => {
    const data = {
      title: TITLES.GET_ROOMS,
    }
    sendSocketMessage(data)
  }

  const handleReceivedRooms = rooms => {
    const $roomsContainer = innerHTML('', document.querySelector('.roomsContainer'))
    const createOnPress = room => {
      stateManager.setRoom(room)
      stateManager.webStateMachineSend('JOIN')
    }
    rooms.forEach(({ name, id: roomId, size, connections: usersCount }) => {
      const room = Room({ name, roomId, size, usersCount, isHost: false })
      appendChildren(
        $roomsContainer,
        RoomItem({
          room,
          onPress: () => createOnPress(room),
        })
      )
    })
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    if (parsedData.title === TITLES.GET_ROOMS) {
      handleReceivedRooms(parsedData.rooms)
    }
  }

  setSocketListener(onMessage)
  RoomListScreen({ $game, stateManager, sendGetRoom })
  sendGetRoom()
}

export default RoomListController
