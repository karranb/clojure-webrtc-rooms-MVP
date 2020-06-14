import { always, compose, curry } from 'ramda'

export const innerHTML = curry((value, $el) => {
  // eslint-disable-next-line no-param-reassign
  $el.innerHTML = value
  return $el
})

export const innerText = curry((text, $el) => {
  // eslint-disable-next-line no-param-reassign
  $el.innerText = text
  return $el
})

export const appendChildren = (container, ...children) => {
  children.forEach(child => container.appendChild(child))
  return container
}

export const querySelector = (query, $el = document) => $el.querySelector(query)

export const createElement = (el, attributes) => {
  const props = attributes || {}
  const { id, class: className } = props
  const $el = document.createElement(el, props)
  $el.setAttribute('id', id)
  $el.setAttribute('class', className)
  return $el
}

export const addListener = curry((listener, fn, $el) => {
  $el.addEventListener(listener, fn)
  return $el
})

export const createButton = (text, attributes, onClick) =>
  compose(addListener('click', onClick || (() => {})), innerText(text), () =>
    createElement('button', attributes)
  )()

export const createP = (text, attributes) =>
  compose(innerText(text), always(createElement('p', attributes)))()
