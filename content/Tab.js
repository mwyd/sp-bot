Vue.component('tab-window', {
    props: ['child', 'index'],
    template: `
        <div class="spb-tab__window">
            <component :index="index" @statusupdate="updateStatus" :is="child"></component>
        </div>
    `,
    methods: {
        updateStatus(newStatus) {
            this.$emit('statusupdate', newStatus);
        }
    }
});

Vue.component('tab', {
    props: ['ico', 'static', 'index', 'child'],
    data() {
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
                :class="{'spb-tab__btn': 1, 'spb-flex': 1, 'spb-tab__btn--bound': bound}">
                <div v-if="!static && displayClose" @click="close" class="spb-tab__close spb-tab-ico"></div>
                <div v-if="!static" :class="getStatusClass" class="spb-tab__ico"></div>
                {{ getTabName }}
            </div>
            <tab-window 
                ref="tabWindow" 
                @statusupdate="updateStatus" 
                :child="child"  
                :index="index" 
                :class="{'spb-tab__window--active': isActive, 'spb-tab__window--hidden': !isActive}"> 
            </tab-window>
        </div>
    `,
    computed: {
        getTabName() {
            return this.child == 'bot' ? this.ico + this.index : this.ico;
        },
        getStatusClass() {
            switch(this.status) {
                case 'idle':
                    return 'spb-tab__status--idle';

                case 'running':
                    return 'spb-tab__status--ok';
            }
        }
    },
    methods: {
        updateStatus(newStatus) {
            this.status = newStatus;
        },
        show() {
            this.bound = !this.bound;
        },
        mEnter() {
            let barScrollPos = this.$el.parentNode.scrollTop;
            let tabWindow = this.$refs.tabWindow.$el;
            let toBottom = window.innerHeight - this.$el.offsetTop - tabWindow.offsetHeight;

            if(toBottom + barScrollPos < 0) {
                tabWindow.style.top = `${this.$el.offsetTop + toBottom - 5}px`;
            } else if (this.$el.offsetTop < barScrollPos) {
                tabWindow.style.top = '5px';
            } else {
                tabWindow.style.top =  `${this.$el.offsetTop - barScrollPos + 5}px`;
            }

            if(!this.bound) this.isActive = true;
            this.displayClose = true;
        },
        mLeave() {
            if(!this.bound) this.isActive = false;
            this.displayClose = false;
        },
        close() {
            this.$emit('close', this.index);
        }
    }
});

