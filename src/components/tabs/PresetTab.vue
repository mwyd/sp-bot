<template>
  <div class="spb-preset-manager">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">
      Preset Manager
    </h3>
    <app-multiple-switch
      :options="Object.values(views)"
      :selected="currentView"
      @option-update="view => currentView = view"
    />
    <div
      v-show="currentView === views.MANAGE"
      class="spb-option"
    >
      <span class="spb-option__description">Select preset</span>
      <select
        v-model="presetModel"
        class="spb-preset-manager__preset-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
      >
        <option
          v-for="[presetId, preset] in sortedPresets(true)"
          :key="'preset-' + presetId"
          :value="presetId"
        >
          {{ preset.name }}
        </option>
      </select>
    </div>
    <div class="spb-preset-manager__preset">
      <div class="spb--flex spb-preset-manager__preset-layout">
        <div>
          <div class="spb-option">
            <span class="spb-option__description">% Deal</span>
            <app-input
              v-model.number="preset.deal"
              :type="'number'"
              :validator="value => (value >= -1000 && value <= 100)"
            />
          </div>
          <div class="spb-option">
            <span class="spb-option__description">$ Item min price</span>
            <app-input
              v-model.number="preset.minPrice"
              :type="'number'"
              :validator="value => (value >= 0 && value <= preset.maxPrice)"
            />
          </div>
          <div class="spb-option">
            <span class="spb-option__description">Name</span>
            <app-input
              v-model="preset.name"
              :type="'text'"
            />
          </div>
        </div>
        <div>
          <div class="spb-option">
            <span class="spb-option__description">% Deal margin</span>
            <app-input
              v-model.number="dealMargin"
              :type="'number'"
              :validator="value => (value >= -preset.deal && value <= 1000 - preset.deal)"
            />
          </div>
          <div class="spb-option">
            <span class="spb-option__description">$ Item max price</span>
            <app-input
              v-model.number="preset.maxPrice"
              :type="'number'"
              :validator="value => (value >= preset.minPrice && value <= 1000000)"
            />
          </div>
          <div class="spb-option">
            <span class="spb-option__description">Refresh time</span>
            <app-input
              v-model.number="preset.runDelay"
              :type="'number'"
              :validator="value => (value >= 0 && value <= 1200)"
            />
          </div>
        </div>
      </div>
      <div class="spb-option">
        <span class="spb-option__description">Search</span>
        <app-input
          v-model="preset.search"
          :type="'text'"
          :placeholder="'Search...'"
        />
      </div>
    </div>
    <div class="spb-preset-manager__buttons-wrapper">
      <div v-if="currentView === views.ADD">
        <button
          class="spb-button spb-button--green"
          :disabled="actionsDisabled"
          @click="disableActions(addPreset(preset))"
        >
          add
        </button>
      </div>
      <div
        v-else
        class="spb--flex"
      >
        <button
          class="spb-preset-manager__button-update spb-button spb-button--green"
          :disabled="presetModel === 0 || actionsDisabled"
          @click="disableActions(updatePreset({id: presetModel, preset: preset}))"
        >
          update
        </button>
        <button
          class="spb-preset-manager__button-delete spb-button spb-button--red"
          :disabled="presetModel === 0 || actionsDisabled"
          @click="disableActions(deletePreset(presetModel).then(resetPresetModel))"
        >
          delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import tabWindowState from '@/enums/tabWindowState'
import presetMixin from '@/mixins/presetMixin'
import actionMixin from '@/mixins/actionMixin'
import AppInput from '@/components/ui/AppInput'
import AppMultipleSwitch from '@/components/ui/AppMultipleSwitch'

const views = Object.freeze({
  ADD: 'Add',
  MANAGE: 'Manage'
})

export default {
  name: 'PresetTab',
  components: {
    AppInput,
    AppMultipleSwitch
  },
  mixins: [presetMixin, actionMixin],
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  emits: ['statusUpdate'],
  data() {
    return {
      views,
      currentView: views.ADD
    }
  },
  computed: {
    ...mapState({
      presetsLoaded: state => state.presetManager.loaded
    })
  },
  watch: {
    currentView() {
      this.presetModel = 0
    },
    presetsLoaded(value) {
      this.$emit('statusUpdate', value ? tabWindowState.OK : tabWindowState.ERROR)
    }
  },
  methods: {
    ...mapActions({
      addPreset: 'presetManager/addPreset',
      updatePreset: 'presetManager/updatePreset',
      deletePreset: 'presetManager/deletePreset'
    }),
    resetPresetModel(success) {
      if (success) {
        this.presetModel = 0
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

.spb-preset-manager__preset {
  padding: 0 2px;
}

.spb-preset-manager__preset-layout {
  justify-content: space-between;
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