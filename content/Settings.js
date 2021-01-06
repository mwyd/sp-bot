Vue.component('settings', {
    template: `
        <div class="spb-bot-settings flex">
            <h3 class="spb-header-3">Settings</h3>
            <div class="spb-flex">
                <div style="width: 100%;" class="spb-bs__option">
                    <span class="spb-bs__desc">Api key</span>
                        <input ref="apiKeyInput" :value="apiKey" type="password" min="0" max="100" :class="'spb-bs__input ' + authStatus">
                </div>
            </div>
        <button @click="save" class="spb-bs__start-button spb-button--green">SAVE</button></div>
    `,
    computed: {
        authStatus() {
            return this.$store.state.auth.pass ? 'input--val-ok' : 'input--val-wrong';
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