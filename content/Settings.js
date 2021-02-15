Vue.component('settings', {
    template: `
        <div class="spb-settings">
            <h3 class="spb-header-3">Settings</h3>
            <div>
                <div class="spb-settings__option">
                    <span class="spb-bot__option-desc">Api key</span>
                        <input ref="apiKeyInput" :value="apiKey" type="password" min="0" max="100" :class="'spb-input ' + authStatus">
                </div>
                <div class="spb-flex spb-settings__option spb-settings__option-row">
                    <div>Remote access</div>
                    <input disabled v-model="remoteAccess" type="checkbox">
                </div>
                <div class="spb-flex spb-settings__option spb-settings__option-row">
                    <div>Open bots at startup</div>
                    <input v-model="openBots" type="checkbox">
                </div>
                <div class="spb-flex spb-settings__option spb-settings__option-row">
                    <div>Display tab preview</div>
                    <input v-model="displayTabPreview" type="checkbox">
                </div>
                <div class="spb-flex spb-settings__option spb-settings__option-row">
                    <div>Always on top</div>
                    <input v-model="alwaysOnTop" type="checkbox">
                </div>
            </div>
        <button @click="save" class="spb-settings__save-btn spb-button spb-button--green">save</button></div>
    `,
    computed: {
        authStatus() {
            const logged = this.$store.getters.logged;
            this.$emit('statusupdate', logged ? 'ok' : 'error');
            return logged ? 'spb-input--val-ok' : 'spb-input--val-wrong';
        },
        apiKey() {
            return this.$store.getters.apiKey;
        },
        remoteAccess: {
            get() { return this.$store.getters.config('remoteAccess'); },
            set(value) { this.$store.commit('setConfig', {type: 'remoteAccess', value: value}); }
        },
        openBots: {
            get() { return this.$store.getters.config('openBots'); },
            set(value) { this.$store.commit('setConfig', {type: 'openBots', value: value}); }
        },
        displayTabPreview: {
            get() { return this.$store.getters.config('displayTabPreview'); },
            set(value) { this.$store.commit('setConfig', {type: 'displayTabPreview', value: value}); }
        },
        alwaysOnTop: {
            get() { return this.$store.getters.config('alwaysOnTop'); },
            set(value) { this.$store.commit('setConfig', {type: 'alwaysOnTop', value: value}); }
        }
    },
    methods: {
        save() {
            this.$store.dispatch('authorize', {user: '', apiKey: this.$refs.apiKeyInput.value});
            this.$store.commit('saveConfig');
        }
    },
    mounted() {
        this.$refs.apiKeyInput.value = this.apiKeyInputVal;
    }
});