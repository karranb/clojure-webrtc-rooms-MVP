import { createElement, createButton, appendChildren } from '_utils'

const Room = ({ $game, renderUsers, sendSetName }) => {
  const $usersContainer = createElement('div', { class: 'usersContainers' } )
  appendChildren(
    $game,
    $usersContainer,
  )

  renderUsers()
}

export default Room
