import { createElement, createButton, appendChildren } from '_utils'

const CreateRoom = ({ $game, createRoom, stateManager }) => {
  const $input = createElement('input')
  const $createButton = createButton('Create Room', {},  () => createRoom($input.value)) 
  const $closeButton = createButton('Close', {},  () => stateManager.webStateMachineSend('CLOSE')) 

  const $container = createElement(
    'div',
    { class: 'createRoomScene' },
  )
  appendChildren($game, appendChildren($container, $input, $createButton, $closeButton))
}

export default CreateRoom
