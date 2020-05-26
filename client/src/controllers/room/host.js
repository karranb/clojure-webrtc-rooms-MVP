import { TITLES, PEER_TITLES, FORCED_CLOSE_TYPES } from '_constants'
import RoomScreen from '_views/room'
import PeerConnection from '_models/peer-connection'
import User from '_models/user'
import { curry } from 'ramda'

import { renderUsers } from './functions'

const Host = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const kick = userId => {
    const room = stateManager.getRoom()
    const user = room.getUser(userId)
    const peerConnection = room.getConnection(user.getConnectionId())
    peerConnection.close()
    onClose(peerConnection, 'Kick')
  }

  const ban = userId => {
    const room = stateManager.getRoom()
    const user = room.getUser(userId)
    const peerConnection = room.getConnection(user.getConnectionId())
    stateManager.updateRoom(room => room.setBannedAddress(peerConnection.getAddress()))
    peerConnection.close()
    onClose(peerConnection, 'Banned')
  }

  const handleRenderUsers = () => {
    renderUsers(stateManager, kick, ban)
  }

  const broadcastMessage = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.sendPeerMessage(title, message))
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
        const user = User({
          name: parsedData.name,
          id: parsedData.id,
          connectionId: peerConnection.getId(),
        })
        stateManager.updateRoom(room => room.setUser(user))
        peerConnection.setUserId(parsedData.id)
        broadcastMessage(PEER_TITLES.GET_USERS, {
          users: stateManager.getRoom().getUsers(),
        })
        handleRenderUsers()
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

  const onClose = (peerConnection, type) => {
    const connectionId = peerConnection.getId()
    const userId = peerConnection.getUserId()
    stateManager.updateRoom(room => room.removeConnection(connectionId).removeUser(userId))
    broadcastMessage(PEER_TITLES.GET_USERS, {
      users: stateManager.getRoom().getUsers(),
    })
    sendSocketMessage({
      title: TITLES.CONNECTION_CLOSED,
      connectionId,
      roomId: stateManager.getRoom().getId(),
      type,
    })
    handleRenderUsers()
  }

  const handleForceClose = (peerConnection, type) => {
    onClose(peerConnection, type)
    peerConnection.close()
  }

  const onReceiveRequest = (address, peerConnection) => {
    const room = stateManager.getRoom()
    const size = room.getSize()
    if (size && size <= Object.keys(room.getConnections()).length) {
      handleForceClose(peerConnection, FORCED_CLOSE_TYPES.FULL)
      return
    }
    if (room.getBannedAddresses().includes(address)) {
      handleForceClose(peerConnection, FORCED_CLOSE_TYPES.BANNED)
    }
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_REQUEST:
        const peerConnection = PeerConnection({ sendSocketMessage })
          .updateOnMessage(e => onPeerMessage(peerConnection, e))
          .updateOnOpen(() => onOpen(peerConnection))
          .updateOnClose(() => onClose(peerConnection))
          .updateOnReceiveRequest(address => onReceiveRequest(address, peerConnection))
          .newChannelResponse(parsedData.offer, parsedData.id)

        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers: () => handleRenderUsers(), quit })
}

export default Host
