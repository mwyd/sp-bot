<template>
    <div 
        class="spb-tab__window spb--rounded-medium"
        :class="tabWindowClass"
    >
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
import Home from '@/components/Home'
import SaleGuard from '@/components/SaleGuard'
import PresetManager from '@/components/PresetManager'
import FriendManager from '@/components/FriendManager'
import Settings from '@/components/Settings'
import Bot from '@/components/Bot'

export default {
    name: 'AppTabWindow',
    components: {
        Home,
        SaleGuard,
        PresetManager,
        FriendManager,
        Settings,
        Bot
    },
    props: {
        id: Number,
        isOpen: Boolean,
        childComponent: String
    },
    emits: ['statusUpdate'],
    computed: {
        tabWindowClass() {
            return [
                this.isOpen ? 'spb-tab__window--active' : 'spb-tab__window--hidden'
            ]
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