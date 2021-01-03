Vue.component('tab-window', {
    props: ['child'],
    template: `
        <div class="spb-tab-window">
            <component :is="child"></component>
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
        <div 
            v-on:mouseenter="mEnter" 
            v-on:mouseleave="mLeave" 
            class="spb-tab">
            <div 
                v-on:click="show"  
                class="spb-tab-btn spb-flex">
                <div v-if="!static && displayClose" v-on:click="close" class="spb-tab-close"></div>
                {{ ico }}
            </div>
            <tab-window 
                :child="child"  
                :class="{'spb-active': isActive, 'spb-hidden': !isActive}"> 
            </tab-window>
        </div>`,
    methods: {
        show() {
            this.bound = !this.bound
        },
        mEnter() {
            let barScrollPos = this.$el.parentNode.scrollTop
            let tabWindow = this.$el.querySelector('.spb-tab-window')
            let toBottom = window.innerHeight - this.$el.offsetTop - tabWindow.offsetHeight

            if(toBottom + barScrollPos < 0) {
                tabWindow.style.top = `${this.$el.offsetTop + toBottom - 5}px`
            } else if (this.$el.offsetTop < barScrollPos) {
                tabWindow.style.top = '5px'
            } else {
                tabWindow.style.top =  `${this.$el.offsetTop - barScrollPos + 5}px`
            }

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

