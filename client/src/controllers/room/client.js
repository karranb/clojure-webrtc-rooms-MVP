import { curry, values } from 'ramda'

import { PEER_TITLES, TITLES, FORCED_CLOSE_TYPES } from '_constants'
import RoomScreen from '_views/room'
import User from '_models/user'

import { renderUsers } from './functions'

const Client = ({ $game, stateManager, setSocketListener }) => {
  const kick = curry((peerConnection, userId) => {
    peerConnection.sendPeerMessage(PEER_TITLES.CLOSE, {
      userId,
      type: FORCED_CLOSE_TYPES.KICKED,
    })
  })

  const ban = curry((peerConnection, userId) => {
    peerConnection.sendPeerMessage(PEER_TITLES.CLOSE, {
      userId,
      type: FORCED_CLOSE_TYPES.BANNED,
    })
  })

  const setIsAdmin = curry((peerConnection, userId, isAdmin) => {
    peerConnection.sendPeerMessage(PEER_TITLES.SET_ADMIN, {
      userId,
      isAdmin,
    })
  })

  const quit = () => {
    stateManager
      .getRoom()
      .getFirstConnection()
      .close()
    stateManager.webStateMachineSend('CLOSE')
  }

  const handleRenderUsers = () => {
    if (stateManager.getUser().getIsAdmin()) {
      const peerConnection = stateManager.getRoom().getFirstConnection()
      renderUsers(stateManager, kick(peerConnection), ban(peerConnection), setIsAdmin(peerConnection))
      return
    }
    renderUsers(stateManager)
  }

  const onPeerMessage = curry((peerConnection, { data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case PEER_TITLES.STABILISH_CONNECTION:
        const user = stateManager.getUser()
        stateManager.updateRoom(room =>
          room.setHost(User({ id: parsedData.id, name: parsedData.name }))
        )
        peerConnection.sendPeerMessage(PEER_TITLES.STABILISH_CONNECTION, {
          name: user.getName(),
          id: user.getId(),
        })
        return
      case PEER_TITLES.GET_USERS:
        const users = values(parsedData.users).map(parsedUser =>
          User({ id: parsedUser.id, name: parsedUser.name })
        )
        stateManager.updateRoom(room => room.setUsers(users))
        handleRenderUsers()
        // renderUsers(stateManager)
        return
      case PEER_TITLES.SET_ADMIN:
        const isAdmin = parsedData.isAdmin
        const userId = parsedData.userId
        const room = stateManager.getRoom()
        const updatedUser = room.getUser(userId).setIsAdmin(isAdmin)
        stateManager.updateRoom(room => room.setUser(updatedUser))
        stateManager.updateUser(user => user.setIsAdmin(isAdmin))
        // renderUsers(stateManager)
        handleRenderUsers()
    }
  })

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_ANSWER:
        const peerConnection = stateManager
          .getRoom()
          .getConnection(parsedData.connectionId)
          .setChannelResponse(parsedData.answer)
          .updateOnMessage(e => onPeerMessage(peerConnection, e))
          .updateOnOpen(() => {})
          .updateOnClose(() => {
            stateManager.webStateMachineSend('CLOSE')
          })
        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
      case TITLES.CONNECTION_CLOSED:
        stateManager.webStateMachineSend('CLOSE')
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers: handleRenderUsers, quit })
}

export default Client
