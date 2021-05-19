<template>
    <div :class="tabWindowClass">
        <component 
            ref="childComponent"
            :id="id"
            :is="childComponent"
            @statusUpdate="statusUpdate"
        >
        </component>
    </div>
</template>

<script>
import Home from './Home.vue'
import SaleGuard from './SaleGuard.vue'
import PresetManager from './PresetManager.vue'
import FriendManager from './FriendManager.vue'
import Settings from './Settings.vue'
import Bot from './Bot.vue'

export default {
    name: 'TabWindow',
    props: {
        id: Number,
        isOpen: Boolean,
        childComponent: String
    },
    emits: ['statusUpdate'],
    components: {
        Home,
        SaleGuard,
        PresetManager,
        FriendManager,
        Settings,
        Bot
    },
    computed: {
        tabWindowClass() {
            const className = 'spb-tab__window spb--rounded-medium'
            return className + (this.isOpen ? ' spb-tab__window--active' : ' spb-tab__window--hidden')
        }
    },
    methods: {
        statusUpdate(status) {
            this.$emit('statusUpdate', status)
        }
    }
}
</script>

<style scoped>
.spb-tab__window {
    position: fixed;
    padding: 10px;
    min-height: 40px;
    min-width: 40px;
    background-color: var(--main-background-color);
}

.spb-tab__window--active {
    left: 50px;
}

.spb-tab__window--hidden {
    left: -200%;
}
</style>