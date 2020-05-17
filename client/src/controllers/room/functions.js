import { appendChildren, createElement, innerText, innerHTML, querySelector } from '_utils'
import { always, compose, map, values } from 'ramda'

export const renderUsers = (stateManager) => {
  const $usersContainer = compose(
    innerHTML(''),
    always(querySelector('.usersContainers'))
  )()
  const users = stateManager.getRoom().getUsers()
  const renderUser = user => compose(innerText(user.name), always(createElement('p')))()
  const $users = map(renderUser, values(users))
  appendChildren($usersContainer, ...$users)
}