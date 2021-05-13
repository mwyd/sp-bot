const initRoot = () => {
    const body = document.querySelector('body')
    const root = document.createElement('div')

    root.setAttribute('id', 'spb-root')
    root.classList.add('spb--z-100')
    body.appendChild(root)

    return root
}

export { initRoot }