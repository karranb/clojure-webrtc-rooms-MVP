import { createElement, createButton, appendChildren } from '_utils'

const Room = ({ $game, renderUsers, quit }) => {
  const $usersContainer = createElement('div', { class: 'usersContainers' } )
  const $closeRoom = createButton('Quit', {}, quit)
  appendChildren(
    $game,
    $closeRoom,
    $usersContainer,
  )

  renderUsers()
}

export default Room
