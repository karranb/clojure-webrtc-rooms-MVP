import Room from '_models/room'
import PeerConnection from '_models/peer-connection'
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
    console.log(rooms)
    const $roomsContainer = innerHTML('', document.querySelector('.roomsContainer'))
    const createOnPress = room => {
      const peerConnection = PeerConnection({ sendSocketMessage }).newChannelRequest(room.getId())
      stateManager.setRoom(room.setConnection(peerConnection))
      stateManager.webStateMachineSend('JOIN')
    }
    rooms.forEach(({ name, id: roomId }) => {
      const room = Room({ name, roomId })
      appendChildren(
        $roomsContainer,
        RoomItem({
          room,
          onPress: ()  => createOnPress(room)
        })
      )
    })
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.GET_ROOMS:
        handleReceivedRooms(parsedData.rooms)
        return
    }
  }

  setSocketListener(onMessage)
  RoomListScreen({ $game, stateManager, sendGetRoom })
  sendGetRoom()
}

export default RoomListController
