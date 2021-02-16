function initRoot() {
    const root = document.createElement('div');

    root.setAttribute('id', 'spb-root');
    root.classList.add('spb-flex');

    root.innerHTML = `
        <div :class="barClass">
            <tab 
                v-for="(tab, index) in staticTabs" 
                :tabdata="tab"
                :index="index"   
                :key="'static-tab-' + tab.id">
            </tab>
            <div class="spb-tab">
                <div @click="$store.commit('addTab')" class="spb-tab__btn spb-flex">+</div>
            </div>
            <tab 
                v-for="(tab, index) in dynamicTabs" 
                :tabdata="tab"
                :index="index" 
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
        computed: {
            staticTabs() {
                return this.$store.getters.staticTabs;
            },
            dynamicTabs() {
                return this.$store.getters.dynamicTabs;
            },
            barClass() {
                const base = 'spb-tab-bar spb-theme-dark';
                const root = this.$root.$el;
                
                if(this.$store.getters.config('alwaysOnTop')) {
                    root.classList.remove('spb-z-100');
                    root.classList.add('spb-z-1200');
                }
                else {
                    root.classList.remove('spb-z-1200');
                    root.classList.add('spb-z-100'); 
                }

                return base;
            }
        },
        beforeCreate() {
            chrome.storage.sync.get(['apiKey', 'user', 'config'], (items) => {
                this.$store.dispatch('authorize', {apiKey: items.apiKey, user: items.user});
                this.$store.commit('loadConfig', items.config);
            });
            this.$store.dispatch('loadPresets');
        }
    });
}