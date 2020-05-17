import { PEER_TITLES, TITLES } from '_constants'
import RoomScreen from '_views/room'
import User from '_models/user'
import { appendChildren, createElement, innerText, innerHTML } from '_utils'
import { compose } from 'ramda'

const Client = ({ $game, stateManager, sendSocketMessage, setSocketListener }) => {
  const renderUsers = () => {
    const $usersContainer = innerHTML('', document.querySelector('.usersContainers'))
    const users = Object.values(stateManager
      .getRoom()
      .getUsers()
    ).map(user => compose(innerText(user.name), () => createElement('p'))())
    appendChildren($usersContainer, ...users)
  }

  const quit = () => {
    stateManager.getRoom().getFirstConnection().close()
    stateManager.webStateMachineSend('CLOSE')
  }

  const onMessage = ({ data }) => {
    const parsedData = JSON.parse(data)
    switch (parsedData.title) {
      case TITLES.CONNECTION_ANSWER:
        const peerConnection = stateManager
          .getRoom()
          .getConnection(parsedData.connectionId)
          .setChannelResponse(parsedData.answer)
          .updateOnMessage(({ data: peerData }) => {
            const parsedPeerData = JSON.parse(peerData)
            switch (parsedPeerData.title) {
              case PEER_TITLES.STABILISH_CONNECTION:
                const user = stateManager.getUser()
                stateManager.updateRoom(room =>
                  room.setHost(User({ id: parsedPeerData.id, name: parsedPeerData.name }))
                )
                peerConnection.sendPeerMessage(PEER_TITLES.STABILISH_CONNECTION, {
                  name: user.getName(),
                  id: user.getId(),
                })
                return
              case PEER_TITLES.GET_USERS:
                Object.values(parsedPeerData.users).forEach(parsedUser => {
                  const user = User({ id: parsedUser.id, name: parsedUser.name })
                  stateManager.updateRoom(room => room.setUser(user))
                })
                renderUsers()
                return
            }
          })
          .updateOnOpen(() => {
          })
          .updateOnClose(() => {
            stateManager.webStateMachineSend('CLOSE')
          })
        stateManager.updateRoom(room => room.setConnection(peerConnection))
        return
    }
  }

  setSocketListener(onMessage)
  RoomScreen({ $game, renderUsers, quit })
}

export default Client
