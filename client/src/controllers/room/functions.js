import { map, values } from 'ramda'

import { clearUsersContainer, appendUsers, RoomUsersItem } from '_views/room'

export const renderUsers = (stateManager, kickFn, banFn) => {
  clearUsersContainer()
  appendUsers(
    map(user => RoomUsersItem(user, kickFn, banFn), values(stateManager.getRoom().getUsers()))
  )
}
