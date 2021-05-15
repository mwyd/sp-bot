<template>
    <div class="spb-preset-manager">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Preset Manager</h3>
        <div class="spb-preset-manager__views-wrapper">
            <div class="spb-preset-manager__views spb--cursor-pointer spb--rounded-small spb--flex">
                <div 
                    @click="currentView = views.ADD" 
                    :class="viewClass(views.ADD)"
                >
                    Add
                </div>
                <div 
                    @click="currentView = views.MANAGE"
                    :class="viewClass(views.MANAGE)"
                >
                    Manage
                </div>
            </div>
        </div>
        <div v-show="currentView == views.MANAGE" class="spb-option">
            <span class="spb-option__description">Select preset</span>
            <select 
                class="spb-input-field spb-input-field--ok spb--font-size-medium spb--rounded-small"
                ref="presetSelect"
                @change="e => changePreset(parseInt(e.target.value))"
            >
                <option 
                    v-for="key in presetsId" 
                    :key="'preset-' + key" 
                    :value="key"
                    :disabled="key == 0"
                >
                    {{ getPreset(key).name }}
                </option>
            </select>
        </div> 
        <div class="spb--flex spb-preset-manager__wrapper">
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal</span>
                    <InputField 
                        v-model.number="currentPreset.deal"
                        :type="'number'"
                        :validator="value => (value >= 0 && value <= 100)"
                    >
                    </InputField>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item min price</span>
                    <InputField 
                        v-model.number="currentPreset.minPrice"
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= currentPreset.maxPrice)"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Name</span>
                    <InputField 
                        v-model="currentPreset.name"
                        :type="'text'" 
                    >
                    </InputField>    
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">Search</span>
                    <InputField 
                        v-model="currentPreset.search"
                        :type="'text'" 
                    >
                    </InputField>
                </div> 
            </div>
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal margin</span>
                    <InputField 
                        v-model.number="currentPreset.dealMargin"
                        :type="'number'" 
                        :validator="value => (value >= -currentPreset.deal && value <= 100 - currentPreset.deal)"
                    >
                    </InputField>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item max price</span>
                    <InputField 
                        v-model.number="currentPreset.maxPrice"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.minPrice && value <= currentPreset.toSpend)"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">$ Money to spend</span>
                    <InputField 
                        v-model.number="currentPreset.toSpend"
                        :type="'number'" 
                        :validator="value => (value >= currentPreset.maxPrice && value <= 1000000)"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Refresh time</span>
                    <InputField
                        v-model.number="currentPreset.runDelay" 
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= 1200)"
                    >
                    </InputField>
                </div>
            </div>
        </div>
        <div class="spb-preset-manager__buttons-wrapper">
            <div v-if="currentView == views.ADD">
                <button 
                    class="spb-button spb-button--green" 
                    @click="addPreset(currentPreset)"
                >
                add
                </button>
            </div>
            <div v-else class="spb--flex">
                <button 
                    class="spb-preset-manager__button-update spb-button spb-button--green" 
                    @click="updatePreset({
                        id: currentPresetId,
                        preset: currentPreset
                    })"
                >
                update
                </button>
                <button 
                    class="spb-preset-manager__button-delete spb-button spb-button--red" 
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
    data() {
        return {
            views: Object.freeze({
                ADD: 'add',
                MANAGE: 'manage'
            }),
            currentView: 'add',
            currentPresetId: 0,
            currentPreset: {...this.getPreset(0)}
        }
    },
    watch: {
        currentView(value) {
            if(value == this.views.ADD) this.changePreset(0)
            else this.changePreset(parseInt(this.$refs.presetSelect.value))
        }
    },
    computed: {
        ...mapState({
            presets: state => state.presetManager.presets
        }),
        ...mapGetters({
            presetsId: 'presetManager/presetsId'
        })
    },
    methods: {
        ...mapActions({
            addPreset: 'presetManager/addPreset',
            updatePreset: 'presetManager/updatePreset',
            deletePreset: 'presetManager/deletePreset'
        }),
        viewClass(view) {
            const className = 'spb-preset-manager__view spb--rounded-small'
            return className + (this.currentView == view ? ` spb-preset-manager__view--active` : '')
        },
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        },
        changePreset(id) {
            this.currentPresetId = id
            this.currentPreset = {...this.getPreset(id)}
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
    margin-left: 4px;
}
</style>