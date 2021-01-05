Vue.component('settings', {
    template: `
        <div class="spb-bot-settings flex">
            <h3 class="spb-header-3">Settings</h3>
            <div class="spb-flex">
                <div style="width: 100%;" class="spb-bs__option">
                    <span class="spb-bs__desc">Api key</span>
                        <input ref="apiKeyInput" type="password" min="0" max="100" class="spb-bs__input input--val-wrong">
                </div>
            </div>
        <button @click="setApiKey" class="spb-bs__start-button spb-button--green">SAVE</button></div>
    `,
    methods: {
        getApiKey() {
            chrome.storage.sync.get(['apiKey'], (items) => {
                this.$refs.apiKeyInput.value = items.apiKey
            })
        },
        setApiKey() {
            chrome.storage.sync.set({'apiKey': this.$refs.apiKeyInput.value})
        }
    },
    mounted() {
        this.getApiKey()
    }
})