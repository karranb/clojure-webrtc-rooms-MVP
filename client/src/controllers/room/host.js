import { TITLES, PEER_TITLES } from '_constants'
import RoomScreen from '_views/room'
import PeerConnection from '_models/peer-connection'
import User from '_models/user'
import { appendChildren, createElement, innerText, innerHTML } from '_utils'
import { compose } from 'ramda'

const Host = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const broadcastMessage = (title, message) => {
    stateManager
      .getRoom()
      .getConnections()
      .forEach(connection => {
        connection.sendPeerMessage(title, message)
      })
  }

  const renderUsers = () => {
    const $usersContainer = innerHTML('', document.querySelector('.usersContainers'))

    const users = Object.values(stateManager.getRoom().getUsers()).map(user =>
      compose(innerText(user.name), () => createElement('p'))()
    )
    appendChildren($usersContainer, ...users)
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_REQUEST:
        const peerConnection = PeerConnection({ sendSocketMessage })
          .newChannelResponse(parsedData.offer, parsedData.id)
          .updateOnMessage(({ data: peerData }) => {
            const parsedPeerData = JSON.parse(peerData)
            switch (parsedPeerData.title) {
              case PEER_TITLES.STABILISH_CONNECTION:
                const user = User({ name: parsedPeerData.name, id: parsedPeerData.id })
                stateManager.updateRoom(room => room.setUser(user))
                peerConnection.setUserId(parsedPeerData.id)
                broadcastMessage(PEER_TITLES.GET_USERS, {
                  users: stateManager.getRoom().getUsers(),
                })
                renderUsers()
                return
              case PEER_TITLES.GET_USERS:
                peerConnection.sendPeerMessage(EER_TITLES.GET_USERS, {
                  users: stateManager.getRoom().getUsers(),
                })
                return
            }
          })
          .updateOnOpen(() => {
            const user = stateManager.getUser()
            peerConnection.sendPeerMessage(PEER_TITLES.STABILISH_CONNECTION, {
              name: user.getName(),
              id: user.getId(),
            })
          })

        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers })
}

export default Host
