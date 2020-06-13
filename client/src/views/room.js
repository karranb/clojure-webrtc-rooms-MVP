import { always, compose } from 'ramda'
import {
  createElement,
  createButton,
  appendChildren,
  innerText,
  innerHTML,
  querySelector,
} from '_utils'

export const RoomUsersItem = (user, handleKick, handleBan, setIsAdmin) => {
  const $nameText = compose(innerText(user.name), always(createElement('span')))()
  const $kickButton =
    handleKick && !user.isHost ? createButton('Kick', {}, () => handleKick(user.id)) : null
  const $banButton =
    handleBan && !user.isHost ? createButton('Ban', {}, () => handleBan(user.id)) : null
  const $setAdminButton =
    !user.isHost && setIsAdmin
      ? createButton(user.isAdmin ? 'Remove Admin' : 'Set Admin', {}, () =>
          setIsAdmin(user.id, !user.isAdmin)
        )
      : null

  return appendChildren(
    createElement('div'),
    ...[$nameText, $kickButton, $banButton, $setAdminButton].filter(el => !!el)
  )
}

export const clearUsersContainer = () =>
  compose(innerHTML(''), always(querySelector('.usersContainers')))()

export const appendUsers = $users =>
  compose(
    $usersContainer => appendChildren($usersContainer, ...$users),
    always(querySelector('.usersContainers'))
  )()

export const renderMessages = messages => {
  querySelector('.messagesContent').innerText = messages.join('\n')
}

const Room = ({ $game, renderUsers, sendMessage, quit }) => {
  const $messagesInput = createElement('input', { class: 'messagesInput' })
  const $messagesButton = createButton('Enviar', { class: 'messagesButton' }, () => {
    sendMessage($messagesInput.value)
    $messagesInput.value = ''
  })
  const $messagesContent = createElement('div', { class: 'messagesContent' })
  const $messagesContainer = appendChildren(
    createElement('div', { class: 'messagesContainers' }),
    $messagesContent,
    $messagesInput,
    $messagesButton
  )
  const $usersContainer = createElement('div', { class: 'usersContainers' })
  const $closeRoom = createButton('Quit', {}, quit)
  appendChildren($game, $closeRoom, $usersContainer, $messagesContainer)

  renderUsers()
}

export default Room
