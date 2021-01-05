Vue.component('tab-window', {
    props: ['child', 'index'],
    template: `
        <div class="spb-tab-window">
            <component :index="index" @statusupdate="updateStatus" :is="child"></component>
        </div>
    `,
    methods: {
        updateStatus(newStatus) {
            this.$emit('statusupdate', newStatus)
        }
    }
})

Vue.component('tab', {
    props: ['ico', 'static', 'index', 'child'],
    data: function() {
        return {
            isActive: false,
            bound: false,
            displayClose: false,
            status: 'idle' 
        }
    },
    template: `
        <div 
            @mouseenter="mEnter" 
            @mouseleave="mLeave" 
            class="spb-tab">
            <div 
                @click="show"  
                :class="{'spb-tab-btn': 1, 'spb-flex': 1, 'spb-tab-btn--bound': bound}">
                <div v-if="!static && displayClose" @click="close" class="spb-tab-close spb-tab-ico"></div>
                <div v-if="!static" :class="getStatusClass" class="spb-tab-ico"></div>
                {{ getTabName }}
            </div>
            <tab-window 
                @statusupdate="updateStatus" 
                :child="child"  
                :index="index" 
                :class="{'spb-active': isActive, 'spb-hidden': !isActive}"> 
            </tab-window>
        </div>`,
    computed: {
        getTabName() {
            return this.child == 'bot' ? this.ico + this.index : this.ico 
        },
        getStatusClass() {
            switch(this.status) {
                case 'idle':
                    return 'spb-status-idle'

                case 'running':
                    return 'spb-status-ok'
            }
        }
    },
    methods: {
        updateStatus(newStatus) {
            this.status = newStatus
        },
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

