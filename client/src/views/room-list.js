import { createElement, createButton, appendChildren } from '_utils'


export const RoomItem = ({ room, onPress }) => createButton(room.getName(), {}, onPress)

const RoomList = ({ $game, sendGetRoom, stateManager }) => {
  const $createRoomButton = createButton('Create Room', {}, () => stateManager.webStateMachineSend('CREATE'))
  const $getRoomsButton = createButton('Update rooms list', {}, sendGetRoom)
  const $roomsContainer = createElement('div', { class: 'roomsContainer' })
  const $container = createElement('div', { class: 'roomListScene' })
  appendChildren(
    $game,
    appendChildren($container, $createRoomButton, $getRoomsButton, $roomsContainer)
  )
}

export default RoomList
