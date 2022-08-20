const initRoot = () => {
  const body = document.querySelector('body')
  const root = document.createElement('div')

  root.setAttribute('id', 'spb-root')
  root.classList.add('spb--z-100')

  if (!body) {
    throw 'Missing body element'
  }

  body.appendChild(root)

  return root
}

export { initRoot }