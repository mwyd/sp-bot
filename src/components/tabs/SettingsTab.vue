<template>
  <div class="spb-settings">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">
      Settings
    </h3>
    <div>
      <div class="spb-option spb--font-size-big">
        <span class="spb-option__description">Token</span>
        <app-input
          v-model="token"
          :type="'password'"
          :model-updated="reloadSettings"
        />
      </div>
      <div class="spb-option spb--font-size-big">
        <span class="spb-option__description spb--clear-padding">Manage</span>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Toggle bots</div>
          <button
            class="spb-button spb-button-tiny"
            :class="runBotsButtonClass"
            :disabled="actionsDisabled"
            @click="disableActions(toggleAllBots())"
          >
            {{ runBots ? "stop" : "start" }}
          </button>
        </div>
      </div>
      <div class="spb-option spb--font-size-big">
        <span class="spb-option__description spb--clear-padding">Config</span>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Display item statistics</div>
          <input
            v-model="displayItemStatistics"
            type="checkbox"
          >
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Display tab preview</div>
          <input
            v-model="displayTabPreview"
            type="checkbox"
          >
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Display interface on top</div>
          <input
            v-model="displayInterfaceOnTop"
            type="checkbox"
          >
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Open tabs at startup</div>
          <input
            v-model="openTabsAtStartup"
            type="checkbox"
          >
        </div>
      </div>
      <div class="spb-option spb--font-size-big">
        <span class="spb-option__description spb--clear-padding">Bot</span>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Market volume limit</div>
          <app-input
            v-model.number="marketVolumeLimit"
            class="spb-settings__option-value"
            :type="'number'"
            :validator="(value) => value >= 0 && value <= 100"
          />
        </div>

        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Target market</div>
          <select
            v-model="targetMarket"
            class="spb-settings__target-market spb-settings__option-value spb-input__field spb-input__field--ok spb--rounded-small"
          >
            <option
              v-for="market in Object.values(targetMarketType)"
              :key="`target-${market}`"
              :value="market"
            >
              {{ market }}
            </option>
          </select>
        </div>
      </div>
      <div class="spb-option spb--font-size-big">
        <span class="spb-option__description spb--clear-padding">Sale Guard</span>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Bid step</div>
          <app-input
            v-model.number="bidStep"
            class="spb-settings__option-value"
            :type="'number'"
            :validator="(value) => value >= 0.01 && value <= 100"
          />
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Lower limit</div>
          <app-input
            v-model.number="lowerLimit"
            class="spb-settings__option-value"
            :type="'number'"
            :validator="(value) => value >= 1 && value <= upperLimit"
          />
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Upper limit</div>
          <app-input
            v-model.number="upperLimit"
            class="spb-settings__option-value"
            :type="'number'"
            :validator="(value) => value >= lowerLimit && value <= 1000"
          />
        </div>
        <div class="spb--flex spb-option__row spb--font-size-medium">
          <div>Update delay</div>
          <app-input
            v-model.number="updateDelay"
            class="spb-settings__option-value"
            :type="'number'"
            :validator="(value) => value >= 0 && value <= 1200"
          />
        </div>
      </div>
    </div>
    <button
      class="spb-settings__save-button spb-button spb-button--green"
      :disabled="actionsDisabled"
      @click="disableActions(saveConfig())"
    >
      save
    </button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import tabWindowState from "@/enums/tabWindowState";
import actionMixin from "@/mixins/actionMixin";
import AppInput from "@/components/ui/AppInput";
import targetMarketType from "@/enums/targetMarketType";

export default {
  name: "SettingsTab",
  components: {
    AppInput,
  },
  mixins: [actionMixin],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  emits: ["statusUpdate"],
  data() {
    return {
      targetMarketType,
    };
  },
  computed: {
    ...mapState({
      authenticated: (state) => state.session.authenticated,
      runBots: (state) => state.bots.runBots,
    }),
    runBotsButtonClass() {
      return [this.runBots ? "spb-button--red" : "spb-button--green"];
    },
    token: {
      get() {
        return this.$store.state.session.token || "";
      },
      set(value) {
        this.$store.commit("session/setToken", value);
      },
    },
    marketVolumeLimit: {
      get() {
        return this.$store.getters["app/config"]("marketVolumeLimit");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "marketVolumeLimit",
          value: value,
        });
      },
    },
    targetMarket: {
      get() {
        return this.$store.getters["app/config"]("targetMarket");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "targetMarket",
          value: value,
        });
      },
    },
    displayItemStatistics: {
      get() {
        return this.$store.getters["app/config"]("displayItemStatistics");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "displayItemStatistics",
          value: value,
        });
      },
    },
    openTabsAtStartup: {
      get() {
        return this.$store.getters["app/config"]("openTabsAtStartup");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "openTabsAtStartup",
          value: value,
        });
      },
    },
    displayTabPreview: {
      get() {
        return this.$store.getters["app/config"]("displayTabPreview");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "displayTabPreview",
          value: value,
        });
      },
    },
    displayInterfaceOnTop: {
      get() {
        return this.$store.getters["app/config"]("displayInterfaceOnTop");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "displayInterfaceOnTop",
          value: value,
        });
      },
    },
    bidStep: {
      get() {
        return this.$store.getters["app/config"]("saleGuardBidStep");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "saleGuardBidStep",
          value: value,
        });
      },
    },
    lowerLimit: {
      get() {
        return this.$store.getters["app/config"]("saleGuardLowerLimit") * 100;
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "saleGuardLowerLimit",
          value: value / 100,
        });
      },
    },
    upperLimit: {
      get() {
        return this.$store.getters["app/config"]("saleGuardUpperLimit") * 100;
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "saleGuardUpperLimit",
          value: value / 100,
        });
      },
    },
    updateDelay: {
      get() {
        return this.$store.getters["app/config"]("saleGuardUpdateDelay");
      },
      set(value) {
        this.$store.commit("app/setConfig", {
          type: "saleGuardUpdateDelay",
          value: value,
        });
      },
    },
  },
  watch: {
    authenticated(value) {
      this.$emit(
        "statusUpdate",
        value ? tabWindowState.OK : tabWindowState.ERROR,
      );
    },
  },
  methods: {
    ...mapActions({
      setupApp: "app/setupApp",
      saveConfig: "app/saveConfig",
      saveToken: "session/saveToken",
      toggleAllBots: "bots/toggleAllInstances",
    }),
    reloadSettings() {
      this.saveToken();
      this.setupApp();
    },
  },
};
</script>

<style scoped>
.spb-settings {
  display: flex;
  flex-direction: column;
  width: 365px;
}

.spb-settings__option-value {
  width: 54px;
  height: 18px;
  font-size: 12px;
}

.spb-settings__target-market {
  background-color: var(--secondary-background-color);
}

.spb-settings__save-button {
  margin-top: 4px;
}
</style>
