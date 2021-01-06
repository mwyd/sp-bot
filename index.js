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
                <div @click="addTab" class="spb-tab-btn spb-flex">+</div>
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

    Vue.use(Vuex);

    const store = new Vuex.Store({
        state: {
            moneySpent: 0,
            items: {
                toConfirm: [],
                active: [],
                finished: []
            }
        },
        getters: {
            getToConfirm(state) {
                let unique = [];
                for(let set of state.items.toConfirm) {
                    set.items.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            },
            getActive(state) {
                let unique = [];
                for(let set of state.items.active) {
                    set.items.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            },
            getFinished(state) {
                let unique = [];
                for(let set of state.items.finished) {
                    set.items.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            }
        },
        mutations: {
            updateMoney(state, money) {
                state.moneySpent += money;
            },
            updateItems(state, data) {
                let set;
                switch(data.type) {
                    case 'toConfirm':
                        set = state.items.toConfirm.find(_set => _set.id == data.spb_index);
                        if(set === undefined) {
                            state.items.toConfirm.push({id: data.spb_index, items: data.items});
                        }
                        else set.items = data.items;
                        break;

                    case 'active':
                        set = state.items.active.find(_set => _set.id == data.spb_index);
                        if(set === undefined) {
                            state.items.active.push({id: data.spb_index, items: data.items});
                        }
                        else set.items = data.items;
                        break;

                    case 'finished':
                        set = state.items.finished.find(_set => _set.id == data.spb_index);
                        if(set === undefined) {
                            state.items.finished.push({id: data.spb_index, items: data.items});
                        }
                        else set.items = data.items;
                        break;
                }
            }
        }
    });

    const app = new Vue({
        el: root,
        store: store,
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

                let tab = {
                    id: id,
                    name: `Bot-${id}`,
                    ico: `B`,
                    child: 'bot'
                }
                
                this.dynamicTabs.push(tab);
                this.tabsCreated++;
            },
            closeTab(index) {
                this.dynamicTabs.splice(index, 1);
            }
        }
    });
}