Vue.component('tab-window', {
    template: `
        <div class="tab-window">
        </div>`
})

Vue.component('tab-btn', {
    props: ['ico', 'window'],
    data: function() {
        return {
            isActive: false,
            bound: false        
        }
    },
    template: `
        <div class="tab-btn--wrapper">
            <div 
                v-on:click="show" 
                v-on:mouseenter="mEnter"
                v-on:mouseleave="mLeave"  
                class="tab-btn spb-flex">
                {{ ico }}
            </div>
            <tab-window v-if="window" v-bind:class="{active: isActive, hidden: !isActive}"></tab-window>
        </div>`,
    methods: {
        show: function() {
            this.bound = !this.bound
        },
        mEnter: function() {
            if(!this.bound) this.isActive = true
        },
        mLeave: function() {
            if(!this.bound) this.isActive = false
        }
    }
})

