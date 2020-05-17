import { createElement, createButton, appendChildren } from '_utils'

const Signin = ({ $game, sendSetName }) => {
  const $input = createElement('input')

  const $btn = createButton('Enviar', {}, () => sendSetName($input.value))

  const $container = createElement('div', { class: 'userNameScene' })
  appendChildren($game, appendChildren($container, $input, $btn))
}

export default Signin
