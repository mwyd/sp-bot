function initRoot() {
    const root = document.createElement('div');

    root.setAttribute('id', 'spb-root');
    root.classList.add('spb-flex');

    root.innerHTML = `
        <div class="spb-tab-bar spb-theme-dark">
            <tab 
                v-for="(tab, index) in staticTabs" 
                :ico="tab.ico" 
                :static="true" 
                :index="index"  
                :child="tab.child" 
                :key="'static-tab-' + tab.id">
            </tab>
            <div class="spb-tab">
                <div @click="addTab" class="spb-tab__btn spb-flex">+</div>
            </div>
            <tab 
                v-for="(tab, index) in dynamicTabs" 
                @close="closeTab" 
                :ico="tab.ico" 
                :static="false" 
                :index="index" 
                :child="tab.child" 
                :key="'dynamic-tab-' + tab.id">
            </tab>
        </div>
    `;

    return root;
}

window.onload = () => {
    const root = initRoot();
    document.querySelector('body').appendChild(root);

    const app = new Vue({
        el: root,
        store: gStore,
        data: {
            staticTabs: [
                {id: 0, name: 'Home', ico: 'H', child: 'home'},
                {id: 1, name: 'Settings', ico: 'S', child: 'settings'}
            ],
            dynamicTabs: [],
            tabsCreated: 2,
            dynmaicTabsLimit: 10
        },
        methods: {
            addTab() {
                if(this.dynamicTabs.length >= this.dynmaicTabsLimit) return;

                id = this.tabsCreated;
                let tab = {id: id, name: `Bot-${id}`, ico: `B`, child: 'bot'}
                
                this.dynamicTabs.push(tab);
                this.tabsCreated++;
            },
            closeTab(index) {
                this.dynamicTabs.splice(index, 1);
            }
        },
        beforeCreate() {
            chrome.storage.sync.get(['apiKey', 'user'], (items) => this.$store.dispatch('authorize', items));
            this.$store.dispatch('loadPresets');
        }
    });
}