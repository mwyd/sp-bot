function initRoot() {
    const root = document.createElement('div')

    root.setAttribute('id', 'spb-root')
    root.classList.add('spb-flex')

    root.innerHTML = `
    <div class="spb-tab-bar theme-dark">
        <tab 
            v-for="(tab, index) in staticTabs" 
            :ico="tab.ico" 
            :static="true" 
            :index="index"  
            :child="index == 0 ? 'home' : 'settings'" 
            :key="'static-tab-' + index">
        </tab>
        <div class="spb-tab">
            <div v-on:click="addTab" class="spb-tab-btn spb-flex">+</div>
        </div>
        <tab 
            v-for="(tab, index) in dynamicTabs" 
            v-on:close="closeTab" 
            :ico="tab.ico" 
            :static="false" 
            :index="index" 
            :child="'bot'" 
            :key="'dynamic-tab-' + tab.id">
        </tab>
    </div>
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
            tabsCreated: 2,
            dynmaicTabsLimit: 10
        },
        methods: {
            addTab() {
                if(this.dynamicTabs.length >= this.dynmaicTabsLimit) return

                this.tabsCreated++
                id = this.tabsCreated

                let tab = {
                    id: id,
                    name: `Bot-${id}`,
                    ico: `B`,
                }
                
                this.dynamicTabs.push(tab)
            },
            closeTab(index) {
                this.dynamicTabs.splice(index, 1)
            }
        }
    })
}