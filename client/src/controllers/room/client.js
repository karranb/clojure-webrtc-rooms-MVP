import { curry, values } from 'ramda'

import { PEER_TITLES, TITLES, FORCED_CLOSE_TYPES } from '_constants'
import RoomScreen from '_views/room'
import User from '_models/user'
import Messages from '_models/messages'
import PeerConnection from '_models/peer-connection'
import { uuid } from '_utils'

import { addMessage, clearStateData, renderUsers } from './functions'

const Client = ({ $game, sendSocketMessage, stateManager, setSocketListener }) => {
  const roomId = stateManager.getRoom().getId()
  const connectionId = uuid()

  const onClose = () => {
    quit()
  }

  const onOpen = () => {
    console.log('connection opened')
  }

  const onCreateOffer = e => {
    if (e.candidate) return
    sendSocketMessage({
      title: 'CONNECTION-REQUEST',
      offer: peerConnection.getState().pc.localDescription.sdp,
      roomId: roomId,
      connectionId: connectionId,
    })
  }

  const messages = Messages()
  const kick = userId => {
    peerConnection.sendMessage(PEER_TITLES.CLOSE, {
      userId,
      type: FORCED_CLOSE_TYPES.KICKED,
    })
  }

  const ban = userId => {
    peerConnection.sendMessage(PEER_TITLES.CLOSE, {
      userId,
      type: FORCED_CLOSE_TYPES.BANNED,
    })
  }

  const setIsAdmin = curry((userId, isAdmin) => {
    peerConnection.sendMessage(PEER_TITLES.SET_ADMIN, {
      userId,
      isAdmin,
    })
  })

  const quit = () => {
    peerConnection.close()
    clearStateData(stateManager)
    stateManager.webStateMachineSend('CLOSE')
  }

  const handleRenderUsers = () => {
    if (stateManager.getUser().getIsAdmin()) {
      renderUsers(stateManager, kick, ban, setIsAdmin)
      return
    }
    renderUsers(stateManager)
  }

  const onStablishConnection = () => {
    const user = stateManager.getUser()
    peerConnection.sendMessage(PEER_TITLES.STABILISH_CONNECTION, {
      name: user.getName(),
      id: user.getId(),
    })
    peerConnection.sendMessage(PEER_TITLES.GET_USERS)
  }

  const onGetUsers = parsedData => {
    const users = values(parsedData.users).map(parsedUser =>
      User({
        id: parsedUser.id,
        name: parsedUser.name,
        isAdmin: parsedUser.isAdmin,
        isHost: parsedUser.isHost,
      })
    )
    stateManager.updateRoom(room => room.setUsers(users))
    handleRenderUsers()
  }

  const onUserJoined = parsedData => {
    stateManager.updateRoom(room =>
      room.setUser(
        User({
          id: parsedData.id,
          name: parsedData.name,
        })
      )
    )
    handleRenderUsers()
  }

  const onUserLeft = parsedData => {
    stateManager.updateRoom(room => room.removeUser(parsedData.userId))
    handleRenderUsers()
  }

  const onSetAdmin = parsedData => {
    const isAdmin = parsedData.isAdmin
    const userId = parsedData.userId
    const room = stateManager.getRoom()
    const updatedUser = room.getUser(userId).setIsAdmin(isAdmin)
    stateManager.updateRoom(room => room.setUser(updatedUser))
    stateManager.updateUser(user => user.setIsAdmin(isAdmin))
    handleRenderUsers()
  }

  const onPeerMessage = curry(({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case PEER_TITLES.STABILISH_CONNECTION:
        onStablishConnection()
        return
      case PEER_TITLES.GET_USERS:
        onGetUsers(parsedData)
        return
      case PEER_TITLES.USER_JOINED:
        onUserJoined(parsedData)
        return
      case PEER_TITLES.USER_LEFT:
        onUserLeft(parsedData)
        return
      case PEER_TITLES.SET_ADMIN:
        onSetAdmin(parsedData)
        return
      case PEER_TITLES.MESSAGE:
        addMessage(messages, parsedData.message)
        return
    }
  })

  const sendMessage = message => peerConnection.sendMessage(PEER_TITLES.MESSAGE, { message })

  const handleConnectionAnswer = (parsedData) => {
    peerConnection.setAnswer(parsedData.answer)
    stateManager.updateRoom(room => room.setConnection(peerConnection))
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_ANSWER:
        handleConnectionAnswer(parsedData)
        return
      case TITLES.CONNECTION_CLOSED:
        quit()
        return
    }
  }

  const peerConnection = PeerConnection()
    .updateOnMessage(onPeerMessage)
    .updateOnCreateOffer(onCreateOffer)
    .updateOnOpen(onOpen)
    .updateOnClose(onClose)
    .createOffer()

  stateManager.updateRoom(room => room.setConnection(peerConnection))

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers: handleRenderUsers, quit, sendMessage })
}

export default Client
