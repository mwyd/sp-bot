Vue.component('settings', {
    template: `
        <div class="spb-bot">
            <h3 class="spb-header-3">Settings</h3>
            <div class="spb-flex">
                <div class="spb-bot__option spb-settings__option">
                    <span class="spb-bot__option-desc">Api key</span>
                        <input @keydown.enter="save" ref="apiKeyInput" :value="apiKey" type="password" min="0" max="100" :class="'spb-input ' + authStatus">
                </div>
            </div>
            <div class="spb-bot__option spb-settings__option spb-flex spb-settings__option-row">
                <div>Remote access</div>
                <input v-model="remoteAccess" type="checkbox">
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
            get() {
                return this.$store.getters.remoteAccess;
            },
            set(value) {
                this.$store.commit('setRemoteAccess', value);
            }
        }
    },
    methods: {
        save() {
            this.$store.dispatch('authorize', {user: '', apiKey: this.$refs.apiKeyInput.value});
        }
    },
    mounted() {
        this.$refs.apiKeyInput.value = this.apiKeyInputVal;
    }
});