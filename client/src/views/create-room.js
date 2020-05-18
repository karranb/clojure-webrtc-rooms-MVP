import { createElement, createP, createButton, appendChildren } from '_utils'

const CreateRoom = ({ $game, createRoom, stateManager }) => {
  const $name = createElement('input')
  const $size = createElement('input')
  const $createButton = createButton('Create Room', {},  () => createRoom($name.value, $size.value)) 
  const $closeButton = createButton('Close', {},  () => stateManager.webStateMachineSend('CLOSE')) 

  const $container = createElement(
    'div',
    { class: 'createRoomScene' },
  )
  appendChildren($game, appendChildren($container, createP('Name'), $name, createP('Size'), $size, $createButton, $closeButton))
}

export default CreateRoom
