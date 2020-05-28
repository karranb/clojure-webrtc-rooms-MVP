import { map, values } from 'ramda'

import { clearUsersContainer, appendUsers, RoomUsersItem } from '_views/room'

export const renderUsers = (stateManager, handleKick, handleBan, setIsAdmin) => {
  clearUsersContainer()
  appendUsers(
    map(user => RoomUsersItem(user, handleKick, handleBan, setIsAdmin), values(stateManager.getRoom().getUsersData()))
  )
}
