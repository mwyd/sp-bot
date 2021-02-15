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
    props: ['index', 'tabdata'],
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
                :class="tabBtnClass">
                <div v-if="!tabdata.static && displayClose" @click="close" class="spb-tab__close spb-tab__ico"></div>
                <div :class="tabStatusClass" class="spb-tab__ico"></div>
                {{ tabName }}
            </div>
            <tab-window 
                ref="tabWindow" 
                @statusupdate="updateStatus" 
                :child="tabdata.child"  
                :index="index" 
                :class="tabWindowClass"> 
            </tab-window>
        </div>
    `,
    computed: {
        tabName() {
            return this.tabdata.child == 'bot' ? this.tabdata.ico + this.index : this.tabdata.ico;
        },
        tabStatusClass() {
            switch(this.status) {
                case 'idle':
                    return 'spb-tab__status--idle';

                case 'running':
                    return 'spb-tab__status--running';

                case 'ok':
                    return 'spb-tab__status--ok';

                case 'notify':
                    return 'spb-tab__status--notify';

                case 'error':
                    return 'spb-tab__status--error';
            }
        },
        tabWindowClass() {
            if(!this.$store.getters.config('displayTabPreview')) {
                return this.isActive && this.bound ? 'spb-tab__window--active' : 'spb-tab__window--hidden';
            }
            return this.isActive ? 'spb-tab__window--active' : 'spb-tab__window--hidden';
        },
        tabBtnClass() {
            const base = `spb-tab__btn spb-flex`;
            return this.bound ? `${base} spb-tab__btn--bound` : base;
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
            this.$store.commit('closeTab', this.index);
        }
    },
    mounted() {
        this.tabdata.mounted(this);
    }
});

