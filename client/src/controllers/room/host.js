import { TITLES, PEER_TITLES, FORCED_CLOSE_TYPES } from '_constants'
import RoomScreen from '_views/room'
import PeerConnection from '_models/peer-connection'
import User from '_models/user'
import Messages from '_models/messages'
import { curry } from 'ramda'

import { addMessage, clearStateData, renderUsers } from './functions'

const Host = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const messages = Messages()
  const roomId = stateManager.getRoom().getId()

  const onClose = (_, peerConnection) => {
    const data = {
      title: TITLES.CONNECTION_CLOSED,
      connectionId: peerConnection.getState().id,
      roomId,
    }
    sendSocketMessage(data)
    handleClose(peerConnection)
  }

  const onSetOffer = (e, peerConnection) => {
    if (e.candidate) {
      const room = stateManager.getRoom()
      const size = room.getSize()
      const address = e.candidate.address
      const isFull = size && size <= Object.keys(room.getConnections()).length
      const isBanned = room.getBannedAddresses().includes(address)
      peerConnection.setState({ address })
      if (isFull) {
        handleForceClose(peerConnection, FORCED_CLOSE_TYPES.FULL)
        return
      }
      if (isBanned) {
        handleForceClose(peerConnection, FORCED_CLOSE_TYPES.BANNED)
      }
      return
    }
    const data = {
      title: TITLES.CONNECTION_ANSWER,
      answer: peerConnection.getState().pc.localDescription.sdp,
      connectionId: peerConnection.getState().id,
    }
    sendSocketMessage(data)
  }

  const kick = userId => {
    const room = stateManager.getRoom()
    const user = room.getUser(userId)
    const peerConnection = room.getConnection(user.getConnectionId())
    peerConnection.close()
    handleClose(peerConnection, 'Kick')
  }

  const ban = userId => {
    const room = stateManager.getRoom()
    const user = room.getUser(userId)
    const peerConnection = room.getConnection(user.getConnectionId())
    stateManager.updateRoom(room => room.setBannedAddress(peerConnection.getState().address))
    peerConnection.close()
    handleClose(peerConnection, 'Banned')
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
    if (isAdmin) {
      addMessage(messages, `user ${user.getName()} is now an admin`)
      return
    }
    addMessage(messages, `user ${user.getName()} admin was removed`)
  }

  const handleRenderUsers = () => {
    renderUsers(stateManager, kick, ban, setIsAdmin)
  }

  const broadcastMessage = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.sendMessage(title, message))
  }

  const quit = title => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => connection.close(title))
    const data = { title: TITLES.CLOSE_ROOM, id: roomId }
    sendSocketMessage(data)
    clearStateData(stateManager)
    stateManager.webStateMachineSend('CLOSE')
  }

  const onStablishConnection = (peerConnection, parsedData) => {
    const { password } = stateManager.getRoom().getPrivateInfo()
    if (password && password !== parsedData.password) {
      peerConnection.sendMessage(PeerConnection.WRONG_PWD)
      setTimeout(() => {
        peerConnection.close()
      }, 200)
    }
    const user = User({
      name: parsedData.name,
      id: parsedData.id,
      connectionId: peerConnection.getState().id,
    })
    stateManager.updateRoom(room => room.setUser(user))
    peerConnection.setState({ userId: parsedData.id })
    console.log(peerConnection.getState())
    broadcastMessage(PEER_TITLES.USER_JOINED, {
      id: parsedData.id,
      name: parsedData.name,
    })
    handleRenderUsers()
    addMessage(messages, `user ${user.getName()} joined the room`)
  }

  const onGetUsers = peerConnection =>
    peerConnection.sendMessage(PEER_TITLES.GET_USERS, {
      users: stateManager.getRoom().getUsersData(),
    })

  const onSetAdmin = (peerConnection, parsedData) => {
    const peerUser = stateManager.getRoom().getUser(peerConnection.getState().userId)
    console.log(peerConnection.getState(), peerConnection.getState().userId)
    if (peerUser.getIsAdmin()) {
      setIsAdmin(parsedData.userId, parsedData.isAdmin)
    }
  }

  const onPeerClose = (peerConnection, parsedData) => {
    const user = stateManager.getRoom().getUser(peerConnection.getState().userId)
    if (user.getIsAdmin()) {
      if (parsedData.type === FORCED_CLOSE_TYPES.BANNED) {
        ban(parsedData.userId)
        return
      }
      if (parsedData.type === FORCED_CLOSE_TYPES.KICKED) {
        kick(parsedData.userId)
      }
    }
  }

  const onPeerMessage = curry(({ data }, peerConnection) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case PEER_TITLES.STABILISH_CONNECTION:
        onStablishConnection(peerConnection, parsedData)
        return
      case PEER_TITLES.GET_USERS:
        onGetUsers(peerConnection)
        return
      case PEER_TITLES.SET_ADMIN:
        onSetAdmin(peerConnection, parsedData)
        return
      case PEER_TITLES.CLOSE:
        onPeerClose(peerConnection, parsedData)
        return
      case PEER_TITLES.MESSAGE:
        sendMessage(stateManager.getRoom().getUser(peerConnection.getState().userId), parsedData.message)
        return
    }
  })

  const onOpen = (_, peerConnection) => {
    const user = stateManager.getUser()
    peerConnection.sendMessage(PEER_TITLES.STABILISH_CONNECTION, {
      name: user.getName(),
      id: user.getId(),
    })
  }

  const handleClose = (peerConnection, type) => {
    const connectionId = peerConnection.getState().id
    const userId = peerConnection.getState().userId
    const user = stateManager.getRoom().getUser(userId)
    stateManager.updateRoom(room => room.removeConnection(connectionId).removeUser(userId))
    broadcastMessage(PEER_TITLES.USER_LEFT, {
      userId,
    })
    sendSocketMessage({
      title: TITLES.CONNECTION_CLOSED,
      connectionId,
      roomId,
      type,
    })
    handleRenderUsers()
    if (user) {
      if (type === 'Kick') {
        addMessage(messages, `user ${user.getName()} was kicked`)
        return
      }
      if (type === 'Banned') {
        addMessage(messages, `user ${user.getName()} was banned`)
        return
      }
      addMessage(messages, `user ${user.getName()} left`)
    }
  }

  const handleForceClose = (peerConnection, type) => {
    handleClose(peerConnection, type)
    peerConnection.close()
  }

  const onConnectionRequest = parsedData => {
    const peerConnection = PeerConnection()
      .setState({ id: parsedData.id })
      .updateOnMessage(onPeerMessage)
      .updateOnOpen(onOpen)
      .updateOnClose(onClose)
      .updateOnSetOffer(onSetOffer)
      .setOffer(parsedData.offer)

    stateManager.updateRoom(room => room.setConnection(peerConnection))
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_REQUEST:
        onConnectionRequest(parsedData)
        return
    }
  }

  const setPassword = password =>
    stateManager.updateRoom(room =>
      room.setPrivateInfo({ password }).setPublicInfo({ hasPassword: true })
    )

  const clearPassword = () =>
    stateManager.updateRoom(room =>
      room.setPrivateInfo({ password: null }).setPublicInfo({ hasPassword: false })
    )

  const commands = [
    { regex: /^\/set_pwd /, fn: message => setPassword(message.split(' ').slice(-1)[0]) },
    { regex: /^\/clear_pwd$/, fn: clearPassword },
    { regex: /^\/q$/, fn: () => quit('close') },
  ]

  const getCommand = (user, message) => {
    if (user !== stateManager.getUser()) {
      return false
    }
    const command = commands.find(item => message.match(item.regex))
    return command
  }

  const sendMessage = curry((user, message) => {
    const command = getCommand(user, message)
    if (command) {
      command.fn(message)
      return
    }
    const parsedMessage = `${user.getName()}: ${message}`
    broadcastMessage(PEER_TITLES.MESSAGE, { message: parsedMessage })
    addMessage(messages, parsedMessage)
  })

  setSocketListener(onMessage)
  RoomScreen({
    $game,
    renderUsers: () => handleRenderUsers(),
    quit,
    sendMessage: sendMessage(stateManager.getUser()),
  })
}

export default Host
