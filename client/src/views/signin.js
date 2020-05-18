import { createElement, createButton, createP, appendChildren } from '_utils'

const Signin = ({ $game, sendSetName }) => {
  const $input = createElement('input')

  const $btn = createButton('Start', {}, () => sendSetName($input.value))

  const $container = createElement('div', { class: 'userNameScene' })
  appendChildren($game, appendChildren($container, createP('Name'), $input, $btn))
}

export default Signin
