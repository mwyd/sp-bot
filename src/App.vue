<template>
  <div class="spb-tab-bar spb--flex spb--theme-dark">
    <div
      v-if="!appLoaded"
      class="spb-tab-bar__loader spb--z-1200 spb--cursor-wait"
    />
    <div class="spb-tab-bar__wrapper">
      <app-tab
        v-for="tab in staticTabs"
        v-bind="tab"
        :key="'tab-' + tab.id"
      />
      <div class="spb-tab">
        <div
          class="spb-tab__button spb--rounded-medium spb--cursor-pointer spb--flex"
          @click="addTab({
            isStatic: false,
            symbol: 'B',
            childComponent: 'BotTab'
          })"
        >
          +
        </div>
      </div>
      <app-tab
        v-for="tab in dynamicTabs"
        v-bind="tab"
        :key="'tab-' + tab.id"
      />
    </div>
    <div
      ref="alertBox"
      :class="alertBoxClass"
    >
      <app-alert
        v-for="[uuid, alert] in alerts"
        :key="'spb-alert-' + uuid"
        :uuid="uuid"
        :type="alert.type"
        :message="alert.message"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import AppTab from '@/components/ui/AppTab'
import AppAlert from '@/components/ui/AppAlert'

export default {
  name: 'App',
  components: {
    AppTab,
    AppAlert
  },
  computed: {
    ...mapState({
      tabs: state => state.app.tabs,
      alerts: state => state.app.alerts,
      appLoaded: state => state.app.loaded
    }),
    staticTabs() {
      return this.tabs.filter(tab => tab.isStatic)
    },
    dynamicTabs() {
      return this.tabs.filter(tab => !tab.isStatic)
    },
    displayInterfaceOnTop() {
      return this.$store.getters['app/config']('displayInterfaceOnTop')
    },
    alertBoxClass() {
      const alertsExists = this.alerts.size > 0

      return {
        'spb-alert-box': true,
        'spb-alert-box--overflow': this.$refs.alertBox?.scrollHeight > window.innerHeight && alertsExists
      }
    }
  },
  watch: {
    displayInterfaceOnTop(value) {
      const root = document.querySelector('#spb-root')

      if (value) {
        root.classList.remove('spb--z-100')
        root.classList.add('spb--z-1200')
      } else {
        root.classList.remove('spb--z-1200')
        root.classList.add('spb--z-100')
      }
    }
  },
  created() {
    this.setupApp()
  },
  methods: {
    ...mapMutations({
      addTab: 'app/addTab'
    }),
    ...mapActions({
      setupApp: 'app/setupApp'
    })
  }
}
</script>

<style>
#spb-root {
  height: 100vh;
  width: 50px;
  position: fixed;
  top: 0;
  left: 0;
  font-family: Gilroy, sans-serif;
}

#spb-root * {
  box-sizing: border-box;
}

.spb-tab-bar {
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: unset;
}

.spb-tab-bar__loader {
  position: absolute;
  height: 100%;
  width: 100%;
}

.spb-tab-bar__wrapper {
  overflow: hidden;
  direction: rtl;
}

.spb-tab-bar__wrapper:hover {
  overflow-y: auto;
}

.spb-alert-box {
  position: fixed;
  right: 0;
  top: 0;
  height: auto;
  width: 300px;
  padding: 4px;
}

.spb-alert-box--overflow {
  height: 100%;
}

.spb-alert-box--overflow:hover {
  overflow-y: auto;
}
</style>
