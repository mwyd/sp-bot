<template>
  <div
    class="spb-tab__window spb--rounded-medium"
    :class="tabWindowClass"
  >
    <component
      :is="childComponent"
      :id="id"
      ref="childComponent"
      @status-update="statusUpdate"
    />
  </div>
</template>

<script>
import HomeTab from "@/components/tabs/HomeTab";
import SaleGuardTab from "@/components/tabs/SaleGuardTab";
import PresetTab from "@/components/tabs/PresetTab";
import FriendTab from "@/components/tabs/FriendTab";
import SettingsTab from "@/components/tabs/SettingsTab";
import BotTab from "@/components/tabs/BotTab";

export default {
  name: "AppTabWindow",
  components: {
    HomeTab,
    SaleGuardTab,
    PresetTab,
    FriendTab,
    SettingsTab,
    BotTab,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    childComponent: {
      type: String,
      required: true,
    },
  },
  emits: ["statusUpdate"],
  computed: {
    tabWindowClass() {
      return [
        this.isOpen ? "spb-tab__window--active" : "spb-tab__window--hidden",
      ];
    },
  },
  methods: {
    statusUpdate(status) {
      this.$emit("statusUpdate", status);
    },
  },
};
</script>

<style scoped>
.spb-tab__window {
  position: fixed;
  padding: 10px;
  min-height: 40px;
  min-width: 40px;
  background-color: var(--main-background-color);
}

.spb-tab__window--active {
  left: 50px;
}

.spb-tab__window--hidden {
  left: -200%;
}
</style>
