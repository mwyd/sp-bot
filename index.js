function initRoot() {
    const root = document.createElement('div')

    root.setAttribute('id', 'spb-root')
    root.classList.add('spb-flex')

    root.innerHTML = `
        <tab 
            v-for="(tab, index) in staticTabs" 
            v-bind:ico="tab.ico" 
            v-bind:static="true" 
            v-bind:index="index"  
            v-bind:child="index == 0 ? 'home' : 'settings'" 
            v-bind:key="'static-tab-' + index">
        </tab>
        <div class="spb-tab">
            <div v-on:click="addTab" class="spb-tab-btn spb-flex">+</div>
        </div>
        <tab 
            v-for="(tab, index) in dynamicTabs" 
            v-bind:ico="tab.ico" 
            v-bind:static="false" 
            v-bind:index="index" 
            v-bind:child="'bot-settings'" 
            v-on:close="closeTab" 
            v-bind:key="'dynamic-tab-' + index">
        </tab>
    `

    return root
}

window.onload = () => {
    const root = initRoot()
    document.querySelector('body').appendChild(root)

    const app = new Vue({
        el: root,
        data: {
            staticTabs: [
                {name: 'Home', ico: 'H'},
                {name: 'Settings', ico: 'S'}
            ],
            dynamicTabs: [],
            dynmaicTabsLimit: 10
        },
        methods: {
            addTab() {
                vm = this

                id = vm.dynamicTabs.length
                if(id >= this.dynmaicTabsLimit) return

                let tab = {
                    name: `Bot-${id}`,
                    ico: `B`,
                }
                vm.dynamicTabs = [tab, ...vm.dynamicTabs]
            },
            closeTab(index) {
                this.dynamicTabs.splice(index, 1)
            }
        }
    })
}