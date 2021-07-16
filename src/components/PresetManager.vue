<template>
    <div class="spb-preset-manager">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Preset Manager</h3>
        <app-multiple-switch
            :options="Object.values(views)"
            :selected="currentView"
            @optionUpdate="view => currentView = view"
        >
        </app-multiple-switch>
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
                    <app-input 
                        v-model.number="currentPreset.deal"
                        :type="'number'"
                        :validator="value => (value >= 0 && value <= 100)"
                    >
                    </app-input>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item min price</span>
                    <app-input 
                        v-model.number="currentPreset.minPrice"
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= currentPreset.maxPrice)"
                    >
                    </app-input>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Name</span>
                    <app-input 
                        v-model="currentPreset.name"
                        :type="'text'" 
                    >
                    </app-input>    
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">Search</span>
                    <app-input 
                        v-model="currentPreset.search"
                        :type="'text'" 
                        :placeholder="'Search...'"
                    >
                    </app-input>
                </div> 
            </div>
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal margin</span>
                    <app-input 
                        v-model.number="currentPreset.dealMargin"
                        :type="'number'" 
                        :validator="value => (value >= -currentPreset.deal && value <= 100 - currentPreset.deal)"
                    >
                    </app-input>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item max price</span>
                    <app-input 
                        v-model.number="currentPreset.maxPrice"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.minPrice && value <= currentPreset.toSpend)"
                    >
                    </app-input>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">$ Money to spend</span>
                    <app-input 
                        v-model.number="currentPreset.toSpend"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.maxPrice && value <= 1000000)"
                    >
                    </app-input>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Refresh time</span>
                    <app-input
                        v-model.number="currentPreset.runDelay" 
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= 1200)"
                    >
                    </app-input>
                </div>
            </div>
        </div>
        <div class="spb-preset-manager__buttons-wrapper">
            <div v-if="currentView == views.ADD">
                <button 
                    class="spb-button spb-button--green"
                    :disabled="actionsDisabled" 
                    @click="disableActions(addPreset(currentPreset))"
                >
                add
                </button>
            </div>
            <div v-else class="spb--flex">
                <button 
                    class="spb-preset-manager__button-update spb-button spb-button--green" 
                    :disabled="currentPresetId == 0 || actionsDisabled"
                    @click="disableActions(updatePreset({id: currentPresetId, preset: currentPreset}))"
                >
                update
                </button>
                <button 
                    class="spb-preset-manager__button-delete spb-button spb-button--red" 
                    :disabled="currentPresetId == 0 || actionsDisabled"
                    @click="disableActions(deletePreset(currentPresetId).then(shiftCurrentPresetIdModel))"
                >
                delete
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import actionMixin from '../mixins/actionMixin.js'
import AppInput from './ui/AppInput.vue'
import AppMultipleSwitch from './ui/AppMultipleSwitch.vue'

export default {
    name: 'PresetManager',
    components: {
        AppInput,
        AppMultipleSwitch
    },
    mixins: [actionMixin],
    props: {
        id: Number
    },
    emits: ['statusUpdate'],
    data() {
        return {
            views: Object.freeze({
                ADD: 'Add',
                MANAGE: 'Manage'
            }),
            currentView: 'Add',
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
            updatePreset: 'presetManager/updatePreset',
            deletePreset: 'presetManager/deletePreset'
        }),
        sortedPresets(sortAsc = true) {
            return this.$store.getters['presetManager/sortedPresets'](sortAsc)
        },
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        },
        shiftCurrentPresetIdModel({success}) {
            if(success) {
                const {length} = this.presetIds
                if(length > 0) this.currentPresetIdModel = this.presetIds[length - 1]
            }
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