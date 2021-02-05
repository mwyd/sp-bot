Vue.component('settings', {
    template: `
        <div class="spb-bot">
            <h3 class="spb-header-3">Settings</h3>
            <div class="spb-flex">
                <div style="width: 100%; padding-bottom: 8px;" class="spb-bot__option">
                    <span class="spb-bot__option-desc">Api key</span>
                        <input @keydown.enter="save" ref="apiKeyInput" :value="apiKey" type="password" min="0" max="100" :class="'spb-input ' + authStatus">
                </div>
            </div>
        <button @click="save" class="spb-button spb-button--green">SAVE</button></div>
    `,
    computed: {
        authStatus() {
            const pass = this.$store.state.auth.pass;
            this.$emit('statusupdate', pass ? 'ok' : 'error');
            return pass ? 'spb-input--val-ok' : 'spb-input--val-wrong';
        },
        apiKey() {
            return this.$store.state.auth.apiKey;
        }
    },
    methods: {
        save() {
            this.$store.dispatch('setAuth', {user: '', apiKey: this.$refs.apiKeyInput.value});
        }
    },
    mounted() {
        this.$refs.apiKeyInput.value = this.apiKeyInputVal;
    }
});