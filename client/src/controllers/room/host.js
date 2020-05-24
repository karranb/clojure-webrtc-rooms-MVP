import { TITLES, PEER_TITLES } from '_constants'
import RoomScreen from '_views/room'
import PeerConnection from '_models/peer-connection'
import User from '_models/user'
import { curry } from 'ramda'

import { renderUsers } from './functions'

const Host = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const broadcastMessage = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => {
        connection.sendPeerMessage(title, message)
      })
  }

  const quit = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.close(title, message))
    const data = { title: TITLES.CLOSE_ROOM, id: stateManager.getRoom().getId() }
    sendSocketMessage(data)
    stateManager.webStateMachineSend('CLOSE')
  }

  const onPeerMessage = curry((peerConnection, { data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case PEER_TITLES.STABILISH_CONNECTION:
        const user = User({ name: parsedData.name, id: parsedData.id })
        stateManager.updateRoom(room => room.setUser(user))
        peerConnection.setUserId(parsedData.id)
        broadcastMessage(PEER_TITLES.GET_USERS, {
          users: stateManager.getRoom().getUsers(),
        })
        renderUsers(stateManager)
        return
      case PEER_TITLES.GET_USERS:
        peerConnection.sendPeerMessage(EER_TITLES.GET_USERS, {
          users: stateManager.getRoom().getUsers(),
        })
        return
    }
  })

  const onOpen = peerConnection => {
    const user = stateManager.getUser()
    peerConnection.sendPeerMessage(PEER_TITLES.STABILISH_CONNECTION, {
      name: user.getName(),
      id: user.getId(),
    })
  }

  const onClose = (userId, connectionId) => {
    stateManager.updateRoom(room => room.removeConnection(connectionId).removeUser(userId))
    broadcastMessage(PEER_TITLES.GET_USERS, {
      users: stateManager.getRoom().getUsers(),
    })
    sendSocketMessage({
      title: TITLES.CONNECTION_CLOSED,
      connectionId,
      roomId: stateManager.getRoom().getId(),
    })
    renderUsers(stateManager)
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_REQUEST:
        const peerConnection = PeerConnection({ sendSocketMessage })
          .newChannelResponse(parsedData.offer, parsedData.id)
          .updateOnMessage(e => onPeerMessage(peerConnection, e))
          .updateOnOpen(() => onOpen(peerConnection))
          .updateOnClose(onClose)

        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers: () => renderUsers(stateManager), quit })
}

export default Host
