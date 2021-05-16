<template>
    <div class="spb-tab-bar spb--flex spb--theme-dark">
        <div 
            v-if="!appLoaded"
            class="spb-tab-bar__loader spb--z-1200 spb--cursor-wait"
        ></div>
        <div class="spb-tab-bar__wrapper">
            <Tab 
                v-for="tab in staticTabs"
                :key="'tab-' + tab.id"
                :id="tab.id"
                :isStatic="tab.isStatic"
                :name="tab.name"
                :symbol="tab.symbol"
                :childComponent="tab.childComponent"
                :tabMounted="tab.tabMounted"
            >
            </Tab>
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
            <Tab 
                v-for="tab in dynamicTabs"
                :key="'tab-' + tab.id"
                :id="tab.id"
                :isStatic="tab.isStatic"
                :name="tab.name"
                :symbol="tab.symbol"
                :childComponent="tab.childComponent"
                :tabMounted="tab.tabMounted"
            >
            </Tab>
        </div>
        <div class="spb-alert-box">
            <Alert
                v-for="(alert, index) in alerts"
                :key="'spb-alert-' + index"
                :type="alert.type"
                :message="alert.message"
            >
            </Alert>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Tab from './components/Tab.vue'
import Alert from './components/Alert.vue'

export default {
    name: 'App',
    components: {
        Tab,
        Alert
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
    computed: {
        ...mapState({
            tabs: state => state.app.tabs,
            alerts: state => state.app.alerts,
            appLoaded: state => state.app.loaded
        }),
        staticTabs() {
            return this.tabs.filter(tab => tab.isStatic)
        },
        dynamicTabs() {
            return this.tabs.filter(tab => !tab.isStatic)
        },
        displayInterfaceOnTop() {
            return this.$store.getters['app/config']('displayInterfaceOnTop')
        }
    },
    methods: {
        ...mapMutations({
            addTab: 'app/addTab'
        }),
        ...mapActions({
            setupApp: 'app/setupApp'
        })
    },
    created() {
        this.setupApp()
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
    left: 0;
    top: 0;
    height: auto;
    width: 250px;
}
</style>
