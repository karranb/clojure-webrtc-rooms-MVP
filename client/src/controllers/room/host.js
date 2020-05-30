import { TITLES, PEER_TITLES, FORCED_CLOSE_TYPES } from '_constants'
import RoomScreen from '_views/room'
import PeerConnection from '_models/peer-connection'
import User from '_models/user'
import { curry } from 'ramda'

import { clearStateData, renderUsers } from './functions'

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

  const setIsAdmin = (userId, isAdmin) => {
    const room = stateManager.getRoom()
    const user = room.getUser(userId).setIsAdmin(isAdmin)
    stateManager.updateRoom(room => room.setUser(user))
    broadcastMessage(PEER_TITLES.SET_ADMIN, {
      userId: user.getId(),
      isAdmin,
    })
    handleRenderUsers()
  }

  const handleRenderUsers = () => {
    renderUsers(stateManager, kick, ban, setIsAdmin)
  }

  const broadcastMessage = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.sendPeerMessage(title, message))
  }

  const quit = title => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.close(title))
    const data = { title: TITLES.CLOSE_ROOM, id: stateManager.getRoom().getId() }
    sendSocketMessage(data)
    clearStateData(stateManager);
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
          users: stateManager.getRoom().getUsersData(),
        })
        handleRenderUsers()
        return
      case PEER_TITLES.GET_USERS:
        peerConnection.sendPeerMessage(PEER_TITLES.GET_USERS, {
          users: stateManager.getRoom().getUsersData(),
        })
        return
      case PEER_TITLES.SET_ADMIN:
        const peerUser = stateManager.getRoom().getUser(peerConnection.getUserId())
        if (peerUser.getIsAdmin()) {
          setIsAdmin(parsedData.userId, parsedData.isAdmin)
        }
        return
      case PEER_TITLES.CLOSE:
        const peerUser2 = stateManager.getRoom().getUser(peerConnection.getUserId())
        if (peerUser2.getIsAdmin()) {
          if (parsedData.type === FORCED_CLOSE_TYPES.BANNED) {
            ban(parsedData.userId)
            return
          }
          if (parsedData.type === FORCED_CLOSE_TYPES.KICKED) {
            kick(parsedData.userId)
          }
        }
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
      users: stateManager.getRoom().getUsersData(),
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
