import { curry, values } from 'ramda'

import { PEER_TITLES, TITLES } from '_constants'
import RoomScreen from '_views/room'
import User from '_models/user'

import { renderUsers } from './functions'

const Client = ({ $game, stateManager, setSocketListener }) => {

  const quit = () => {
    stateManager
      .getRoom()
      .getFirstConnection()
      .close()
    stateManager.webStateMachineSend('CLOSE')
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
        values(parsedData.users).forEach(parsedUser => {
          const user = User({ id: parsedUser.id, name: parsedUser.name })
          stateManager.updateRoom(room => room.setUser(user))
        })
        renderUsers(stateManager)
        return
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
          .updateOnMessage((e) => onPeerMessage(peerConnection, e))
          .updateOnOpen(() => {})
          .updateOnClose(() => {
            stateManager.webStateMachineSend('CLOSE')
          })
        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers: () => renderUsers(stateManager), quit })
}

export default Client
