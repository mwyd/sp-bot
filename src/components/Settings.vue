<template>
    <div class="spb-settings">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Settings</h3>
        <div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description">Token</span>
                    <InputField
                        v-model="token"
                        :type="'password'"
                        :valid="authenticated"
                        :modelUpdated="() => {
                            saveToken()
                            setupApp()
                        }"
                    >
                    </InputField>
            </div>
            <div class="spb-option spb--font-size-big">
                <span class="spb-option__description spb--clear-padding">Manage</span>
                    <div class="spb--flex spb-option__row spb--font-size-medium">
                        <div>Toggle bots</div>
                        <button 
                            :class="runBotsButtonClass"
                            @click="toggleRunBots" 
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
            </div>
        <button 
            class="spb-settings__save-button spb-button spb-button--green"
            @click="saveConfig"
        >
        save
        </button>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import InputField from './InputField.vue'

export default {
    name: 'Settings',
    emits: ['statusUpdate'],
    components: {
        InputField
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
            const className = 'spb-button spb-button-tiny';
            return className + (this.runBots ? ' spb-button--red' : ' spb-button--green');
        },
        token: {
            get() {
                return this.$store.state.session.token
            },
            set(value) {
                this.$store.commit('session/updateToken', value)
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
        }
    },
    methods: {
        ...mapMutations({
            toggleRunBots: 'bots/toggleRunBots'
        }),
        ...mapActions({
            setupApp: 'app/setupApp',
            saveConfig: 'app/saveConfig',
            authenticate: 'session/authenticate',
            saveToken: 'session/saveToken'
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

.spb-settings__save-button {
    margin-top: 4px;
}
</style>