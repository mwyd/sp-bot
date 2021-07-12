<template>
    <div class="spb-preset-manager">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Preset Manager</h3>
        <div class="spb-preset-manager__views-wrapper">
            <div class="spb-preset-manager__views spb--cursor-pointer spb--rounded-small spb--flex">
                <div 
                    class="spb-preset-manager__view spb--rounded-small"
                    :class="viewClass(views.ADD)"
                    @click="currentView = views.ADD" 
                >
                    Add
                </div>
                <div 
                    class="spb-preset-manager__view spb--rounded-small"
                    :class="viewClass(views.MANAGE)"
                    @click="currentView = views.MANAGE"
                >
                    Manage
                </div>
            </div>
        </div>
        <div v-show="currentView == views.MANAGE" class="spb-option">
            <span class="spb-option__description">Select preset</span>
            <select 
                class="spb-preset-manager__preset-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
                v-model="currentPresetIdModel"
            >
                <option 
                    v-for="pair in sortedPresets(true)" 
                    :key="'preset-' + pair[0]" 
                    :value="pair[0]"
                >
                    {{ pair[1].name }}
                </option>
            </select>
        </div> 
        <div class="spb--flex spb-preset-manager__wrapper">
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal</span>
                    <input-field 
                        v-model.number="currentPreset.deal"
                        :type="'number'"
                        :validator="value => (value >= 0 && value <= 100)"
                    >
                    </input-field>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item min price</span>
                    <input-field 
                        v-model.number="currentPreset.minPrice"
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= currentPreset.maxPrice)"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Name</span>
                    <input-field 
                        v-model="currentPreset.name"
                        :type="'text'" 
                    >
                    </input-field>    
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">Search</span>
                    <input-field 
                        v-model="currentPreset.search"
                        :type="'text'" 
                        :placeholder="'Search...'"
                    >
                    </input-field>
                </div> 
            </div>
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal margin</span>
                    <input-field 
                        v-model.number="currentPreset.dealMargin"
                        :type="'number'" 
                        :validator="value => (value >= -currentPreset.deal && value <= 100 - currentPreset.deal)"
                    >
                    </input-field>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item max price</span>
                    <input-field 
                        v-model.number="currentPreset.maxPrice"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.minPrice && value <= currentPreset.toSpend)"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">$ Money to spend</span>
                    <input-field 
                        v-model.number="currentPreset.toSpend"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.maxPrice && value <= 1000000)"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Refresh time</span>
                    <input-field
                        v-model.number="currentPreset.runDelay" 
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= 1200)"
                    >
                    </input-field>
                </div>
            </div>
        </div>
        <div class="spb-preset-manager__buttons-wrapper">
            <div v-if="currentView == views.ADD">
                <button 
                    class="spb-button spb-button--green"
                    :disabled="actionsDisabled" 
                    @click="() => {
                        actionsDisabled = true
                        addPreset(currentPreset)
                        .then(() => actionsDisabled = false)
                    }"
                >
                add
                </button>
            </div>
            <div v-else class="spb--flex">
                <button 
                    class="spb-preset-manager__button-update spb-button spb-button--green" 
                    :disabled="currentPresetId == 0 || actionsDisabled"
                    @click="() => {
                        actionsDisabled = true
                        updatePreset({
                            id: currentPresetId,
                            preset: currentPreset
                        })
                        .then(() => actionsDisabled = false)
                    }"
                >
                update
                </button>
                <button 
                    class="spb-preset-manager__button-delete spb-button spb-button--red" 
                    :disabled="currentPresetId == 0 || actionsDisabled"
                    @click="deletePreset(currentPresetId)"
                >
                delete
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import InputField from './InputField.vue'

export default {
    name: 'PresetManager',
    components: {
        InputField
    },
    props: {
        id: Number
    },
    emits: ['statusUpdate'],
    data() {
        return {
            actionsDisabled: false,
            views: Object.freeze({
                ADD: 'add',
                MANAGE: 'manage'
            }),
            currentView: 'add',
            currentPresetId: 0,
            currentPreset: {...this.getPreset(0)}
        }
    },
    computed: {
        ...mapState({
            presets: state => state.presetManager.presets,
            presetsLoaded: state => state.presetManager.loaded,
            tabStates: state => state.app.tabStates
        }),
        ...mapGetters({
            presetIds: 'presetManager/presetIds'
        }),
        currentPresetIdModel: {
            get() {
                return this.currentPresetId
            },
            set(value) {
                this.currentPresetId = value
                this.currentPreset = {...this.getPreset(this.currentPresetId)}
            }
        }
    },
    watch: {
        currentView() {
            this.currentPresetIdModel = 0
        },
        presetsLoaded(value) {
            this.$emit('statusUpdate', value ? this.tabStates.OK : this.tabStates.ERROR)
        }
    },
    methods: {
        ...mapActions({
            addPreset: 'presetManager/addPreset',
            updatePreset: 'presetManager/updatePreset'
        }),
        viewClass(view) {
            return [
                this.currentView == view ? `spb-preset-manager__view--active` : ''
            ]
        },
        sortedPresets(sortAsc = true) {
            return this.$store.getters['presetManager/sortedPresets'](sortAsc)
        },
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        },
        deletePreset(id) {
            this.actionsDisabled = true

            this.$store.dispatch('presetManager/deletePreset', id)
                .then(({success}) => {
                    if(success) {
                        const {length} = this.presetIds
                        if(length > 0) this.currentPresetIdModel = this.presetIds[length - 1]

                        this.actionsDisabled = false
                    }
                })
        }
    }
}
</script>

<style scoped>
.spb-preset-manager {
    display: flex;
    flex-direction: column;
    width: 365px;
    position: relative;
}

.spb-preset-manager__preset-select {
    background-color: var(--secondary-background-color);
    height: 32px;
}

.spb-preset-manager__views-wrapper {
    padding: 10px 0px;
}

.spb-preset-manager__views {
    background-color: var(--alternative-background-color);
}

.spb-preset-manager__view {
    text-align: center;
    width: 100%;
}

.spb-preset-manager__view--active {
    background-color: var(--secondary-background-color);
}

.spb-preset-manager__wrapper {
    justify-content: space-around;
}

.spb-preset-manager__buttons-wrapper {
    margin-top: 8px;
}

.spb-preset-manager__button-update {
    margin-right: 4px;
}

.spb-preset-manager__button-delete {
    width: auto;
    min-width: 70px;
    margin-left: 4px;
}
</style>