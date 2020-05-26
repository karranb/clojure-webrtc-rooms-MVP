import { always, compose } from 'ramda'
import {
  createElement,
  createButton,
  appendChildren,
  innerText,
  innerHTML,
  querySelector,
} from '_utils'

export const RoomUsersItem = (user, kickFn, banFn) => {
  console.log(user)
  const $nameText = compose(innerText(user.name), always(createElement('span')))()
  const $kickButton = kickFn ? createButton('Kick', {}, () => kickFn(user.id)) : null
  const $banButton = banFn ? createButton('Ban', {}, () => banFn(user.id)) : null

  return appendChildren(
    createElement('div'),
    ...[$nameText, $kickButton, $banButton].filter(el => !!el)
  )
}

export const clearUsersContainer = () =>
  compose(innerHTML(''), always(querySelector('.usersContainers')))()

export const appendUsers = $users =>
  compose(
    $usersContainer => appendChildren($usersContainer, ...$users),
    always(querySelector('.usersContainers'))
  )()

const Room = ({ $game, renderUsers, quit }) => {
  const $usersContainer = createElement('div', { class: 'usersContainers' })
  const $closeRoom = createButton('Quit', {}, quit)
  appendChildren($game, $closeRoom, $usersContainer)

  renderUsers()
}

export default Room
