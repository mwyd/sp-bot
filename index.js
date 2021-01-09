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

    Vue.use(Vuex);

    const store = new Vuex.Store({
        state: {
            auth: {
                user: '',
                apiKey: '',
                pass: false
            },
            moneySpent: 0,
            botInstances: [],
            notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
            sp: {
                csrfCookie: getCookie('csrf_cookie')
            }
        },
        getters: {
            getToConfirm(state) {
                let unique = [];
                for(let bot of state.botInstances) {
                    bot.instance.items.toConfirm.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            },
            getActive(state) {
                let unique = [];
                for(let bot of state.botInstances) {
                    bot.instance.items.pending.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            },
            getFinished(state) {
                let unique = [];
                for(let bot of state.botInstances) {
                    bot.instance.items.finished.filter(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                }
                return unique;
            },
            getCsrfCookie(state) {
                return state.sp.csrfCookie;
            },
            getNotifySound(state) {
                return state.notifiSound;
            }
        },
        mutations: {
            addBot(state, data) {
                state.botInstances.push(data);
            },
            setCsrfCookie(state, cookie) {
                state.sp.csrfCookie = cookie;
            },
            closeBot(state, index) {
                let id = state.botInstances.findIndex(bot => bot.index == index);
                if(id > -1) state.botInstances.splice(id, 1);
            }
        },
        actions: {
            setAuth(context, data) {
                context.state.auth.user = data.user;
                context.state.auth.apiKey = data.apiKey;

                chrome.runtime.sendMessage({action: 'auth', params: {apiKey: data.apiKey}}, res => {
                    const {user, success} = res.data;
    
                    if(success) {
                        context.state.auth.user = user;
                        context.state.auth.apiKey = data.apiKey;
                        context.state.auth.pass = true;
                    }
                    else context.state.auth.pass = false;

                    chrome.storage.sync.set({user: context.state.auth.user, apiKey: context.state.auth.apiKey});
                });
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
                let tab = {id: id, name: `Bot-${id}`, ico: `B`, child: 'bot'}
                
                this.dynamicTabs.push(tab);
                this.tabsCreated++;
            },
            closeTab(index) {
                this.dynamicTabs.splice(index, 1);
            }
        },
        beforeMount() {
            chrome.storage.sync.get(['apiKey', 'user'], (items) => {
                let user = items.user;
                let apiKey = items.apiKey;

                this.$store.dispatch('setAuth', {user: user, apiKey: apiKey});
            });
        }
    });
}