<template>
    <div class="spb-tab-bar spb--flex spb--theme-dark">
        <div 
            v-if="!appLoaded || !backgroundMounted"
            class="spb-tab-bar__loader spb--z-1200"
            :class="tabBarLoaderClass"
        ></div>
        <div class="spb-tab-bar__wrapper">
            <app-tab 
                v-for="tab in staticTabs"
                :key="'tab-' + tab.id"
                :id="tab.id"
                :is-static="tab.isStatic"
                :name="tab.name"
                :symbol="tab.symbol"
                :child-component="tab.childComponent"
                :tab-mounted="tab.tabMounted"
            >
            </app-tab>
            <div class="spb-tab">
                <div 
                    class="spb-tab__button spb--rounded-medium spb--cursor-pointer spb--flex"
                    @click="addTab({
                        isStatic: false,
                        name: 'Bot',
                        symbol: 'B',
                        childComponent: 'Bot'
                    })"
                >+</div>
            </div>
            <app-tab 
                v-for="tab in dynamicTabs"
                :key="'tab-' + tab.id"
                :id="tab.id"
                :is-static="tab.isStatic"
                :name="tab.name"
                :symbol="tab.symbol"
                :child-component="tab.childComponent"
                :tab-mounted="tab.tabMounted"
            >
            </app-tab>
        </div>
        <div class="spb-alert-box">
            <app-alert
                v-for="[uuid, alert] in alerts"
                :key="'spb-alert-' + uuid"
                :uuid="uuid"
                :type="alert.type"
                :message="alert.message"
            >
            </app-alert>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import AppTab from './components/ui/AppTab.vue'
import AppAlert from './components/ui/AppAlert.vue'

export default {
    name: 'App',
    components: {
        AppTab,
        AppAlert
    },
    computed: {
        ...mapState({
            tabs: state => state.app.tabs,
            alerts: state => state.app.alerts,
            appLoaded: state => state.app.loaded,
            backgroundMounted: state => state.app.backgroundMounted
        }),
        staticTabs() {
            return this.tabs.filter(tab => tab.isStatic)
        },
        dynamicTabs() {
            return this.tabs.filter(tab => !tab.isStatic)
        },
        displayInterfaceOnTop() {
            return this.$store.getters['app/config']('displayInterfaceOnTop')
        },
        tabBarLoaderClass() {
            return [
                !this.backgroundMounted ? 'spb--cursor-not-allowed' : 'spb--cursor-wait'
            ]
        }
    },
    watch: {
        displayInterfaceOnTop(value) {
            const root = document.querySelector('#spb-root')

            if(value) {
                root.classList.remove('spb--z-100')
                root.classList.add('spb--z-1200')
            }
            else {
                root.classList.remove('spb--z-1200')
                root.classList.add('spb--z-100')
            }
        }
    },
    created() {
        this.setupApp()
    },
    methods: {
        ...mapMutations({
            addTab: 'app/addTab'
        }),
        ...mapActions({
            setupApp: 'app/setupApp'
        })
    }
}
</script>

<style>
#spb-root {
    height: 100vh;
    width: 50px;
    position: fixed;
    top: 0;
    left: 0;
    font-family: Gilroy, sans-serif;
}

.spb-tab-bar {
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: unset;
}

.spb-tab-bar__loader {
    position: absolute;
    height: 100%;
    width: 100%;
}

.spb-tab-bar__wrapper {
    overflow: hidden;
    direction: rtl;
}

.spb-tab-bar__wrapper:hover {
    overflow-y: auto;
}

.spb-alert-box {
    position: fixed;
    right: 0;
    top: 0;
    height: auto;
    width: 250px;
    padding: 4px;
}
</style>
