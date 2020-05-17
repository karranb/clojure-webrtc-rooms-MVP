import { compose, curry } from 'ramda'

export const innerHTML = curry((value, $el) => {
  $el.innerHTML = value
  return $el
})

export const innerText = curry((text, $el) => {
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
