import { map, values } from 'ramda'
import User from '_models/user'
import Room from '_models/room'
import { renderMessages } from '_views/room'

import { clearUsersContainer, appendUsers, RoomUsersItem } from '_views/room'


export const addMessage = (model, message) => {
  model.addMessage(message)
  renderMessages(model.getMessages())
}

export const renderUsers = (stateManager, handleKick, handleBan, setIsAdmin) => {
  clearUsersContainer()
  appendUsers(
    map(
      user => RoomUsersItem(user, handleKick, handleBan, setIsAdmin),
      values(stateManager.getRoom().getUsersData())
    )
  )
}

export const clearStateData = stateManager => {
  stateManager.updateUser(user => User({ name: user.getName(), id: user.getId() }))
  stateManager.updateRoom(() => Room({}))
}
