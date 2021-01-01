Vue.component('tab-window', {
    props: ['child'],
    template: `
        <div class="spb-tab-window">
            <component v-bind:is="child"></component>
        </div>`
})

Vue.component('tab', {
    props: ['ico', 'static', 'index', 'child'],
    data: function() {
        return {
            isActive: false,
            bound: false,
            displayClose: false 
        }
    },
    template: `
        <div class="spb-tab">
            <div 
                v-on:click="show" 
                v-on:mouseenter="mEnter"
                v-on:mouseleave="mLeave"  
                class="spb-tab-btn spb-flex">
                <div v-if="!static && displayClose" v-on:click="close" class="spb-tab-close"></div>
                {{ ico }}
            </div>
            <tab-window 
                v-bind:child="child"  
                v-bind:class="{'spb-active': isActive, 'spb-hidden': !isActive}"> 
            </tab-window>
        </div>`,
    methods: {
        show() {
            this.bound = !this.bound
        },
        mEnter() {
            let tabWindow = this.$el.querySelector('.spb-tab-window')
            let bottomSpacing = window.innerHeight - this.$el.offsetTop - tabWindow.offsetHeight

            bottomSpacing < 0 ? tabWindow.style.top = `${bottomSpacing}px` : tabWindow.style.top = '5px'
            if(!this.bound) this.isActive = true
            this.displayClose = true
        },
        mLeave() {
            if(!this.bound) this.isActive = false
            this.displayClose = false
        },
        close() {
            this.$emit('close', this.index)
        }
    }
})

