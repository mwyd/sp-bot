<template>
    <div class="spb-settings">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Settings</h3>
        <div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description">Token</span>
                    <input-field
                        v-model="token"
                        :type="'password'"
                        :modelUpdated="() => {
                            saveToken()
                            setupApp()
                        }"
                    >
                    </input-field>
            </div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description spb--clear-padding">Manage</span>
                    <div class="spb--flex spb-option__row spb--font-size-medium">
                        <div>Toggle bots</div>
                        <button 
                            class="spb-button spb-button-tiny"
                            :class="runBotsButtonClass"
                            @click="toggleAllBots" 
                        >
                            {{ runBots ? 'stop' : 'start' }}
                        </button>
                    </div>
            </div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description spb--clear-padding">Config</span>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Display item statistics</div>
                    <input v-model="displayItemStatistics" type="checkbox">
                </div>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Display tab preview</div>
                    <input v-model="displayTabPreview" type="checkbox">
                </div>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Display interface on top</div>
                    <input v-model="displayInterfaceOnTop" type="checkbox">
                </div>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Open tabs at startup</div>
                    <input v-model="openTabsAtStartup" type="checkbox">
                </div>
            </div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description spb--clear-padding">Sale Guard</span>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Bid step</div>
                    <input-field 
                        v-model.number="bidStep"
                        class="spb-settings__bid-step"
                        :type="'number'"
                        :validator="value => value >= 0.01 && value <= 100"
                    >
                    </input-field>
                </div>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Safe discount</div>
                    <input-field 
                        v-model.number="safeDiscount"
                        class="spb-settings__safe-discount"
                        :type="'number'"
                        :validator="value => value >= 1 && value <= 100"
                    >
                    </input-field>
                </div>
                <div class="spb--flex spb-option__row spb--font-size-medium">
                    <div>Item update delay</div>
                    <input-field 
                        v-model.number="itemUpdateDelay"
                        class="spb-settings__item-update-delay"
                        :type="'number'"
                        :validator="value => value >= 0 && value <= 1200"
                    >
                    </input-field>
                </div>
            </div>
        </div>
        <button 
            class="spb-settings__save-button spb-button spb-button--green"
            :disabled="buttonsDisabled"
            @click="() => {
                buttonsDisabled = true
                saveConfig()
                .then(() => buttonsDisabled = false)
            }"
        >
        save
        </button>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import InputField from './InputField.vue'

export default {
    name: 'Settings',
    emits: ['statusUpdate'],
    components: {
        InputField
    },
    data() {
        return {
            buttonsDisabled: false
        }
    },
    watch: {
        authenticated(value) {
            this.$emit('statusUpdate', value ? this.tabStates.OK : this.tabStates.ERROR)
        }
    },
    computed: {
        ...mapState({
            authenticated: state => state.session.authenticated,
            tabStates: state => state.app.tabStates,
            runBots: state => state.bots.runBots
        }),
        runBotsButtonClass() {
            return [
                this.runBots ? 'spb-button--red' : 'spb-button--green'
            ]
        },
        token: {
            get() {
                return this.$store.state.session.token
            },
            set(value) {
                this.$store.commit('session/setToken', value)
            }
        },
        displayItemStatistics: {
            get() {
                return this.$store.getters['app/config']('displayItemStatistics')
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'displayItemStatistics',
                    value: value
                })
            }
        },
        openTabsAtStartup: {
            get() {
                return this.$store.getters['app/config']('openTabsAtStartup')
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'openTabsAtStartup',
                    value: value
                })
            }
        },
        displayTabPreview: {
            get() {
                return this.$store.getters['app/config']('displayTabPreview')
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'displayTabPreview',
                    value: value
                })  
            }
        },
        displayInterfaceOnTop: {
            get() {
                return this.$store.getters['app/config']('displayInterfaceOnTop')
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'displayInterfaceOnTop',
                    value: value
                }) 
            }
        },
        bidStep: {
            get() {
                return this.$store.getters['app/config']('saleGuardBidStep')
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'saleGuardBidStep',
                    value: value
                })
            }
        },
        safeDiscount: {
            get() {
                return this.$store.getters['app/config']('saleGuardSaleDiscount') * 100
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'saleGuardSaleDiscount',
                    value: value / 100
                })
            }
        },
        itemUpdateDelay: {
            get() {
                return this.$store.getters['app/config']('saleGuardItemUpdateDelay') / 1000
            },
            set(value) {
                this.$store.commit('app/setConfig', {
                    type: 'saleGuardItemUpdateDelay',
                    value: value * 1000
                })
            }
        }
    },
    methods: {
        ...mapActions({
            setupApp: 'app/setupApp',
            saveConfig: 'app/saveConfig',
            authenticate: 'session/authenticate',
            saveToken: 'session/saveToken',
            toggleAllBots: 'bots/toggleAllInstances'
        })
    }
}
</script>

<style scoped>
.spb-settings {
    display: flex;
    flex-direction: column;
    width: 365px;
}

.spb-settings__bid-step, .spb-settings__safe-discount, .spb-settings__item-update-delay {
    width: 54px;
    height: 18px;
    font-size: 12px;
}

.spb-settings__save-button {
    margin-top: 4px;
}
</style>