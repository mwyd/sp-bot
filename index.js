function initRoot() {
    const root = document.createElement('div')

    root.setAttribute('id', 'spb-root')
    root.classList.add('spb-flex')

    root.innerHTML = `
        <tab-btn 
            v-for="tab in activeTabs" 
            v-bind:ico="tab.ico" 
            v-bind:window="tab.window" 
            v-bind:key="tab.id">
        </tab-btn>
    `

    return root
}

window.onload = () => {
    const root = initRoot()
    document.querySelector('body').appendChild(root)

    const app = new Vue({
        el: root,
        data: {
            activeTabs: [
                {id: 0, name: 'Home', ico: 'H', window: true},
                {id: 1, name: 'Settings', ico: 'S', window: true},
                {id: 2, name: 'New bot', ico: '+', window: false}
            ]
        },
        methods: {
            addTab: function() {
                vue = this
                let tab = {
                    id: vue.activeTabs.length,
                    name: `Bot${id}`,
                    ico: `$B{id}`,
                    window: true
                }
                vue.activeTabs.push(tab)
            }
        }
    })
}