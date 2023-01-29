<template>
  <div
    class="spb-tab"
    @mouseenter="showTabWindow"
    @mouseleave="hideTabWindow"
  >
    <div
      class="spb-tab__button spb--cursor-pointer spb--rounded-medium spb--flex"
      :class="tabButtonClass"
      @click="toggleIsBound"
    >
      <div
        v-if="!isStatic && isMouseOver"
        class="spb-tab__icon spb-tab__icon--close spb-tab__icon--right"
        @click="close(id)"
      />
      <div
        class="spb-tab__icon spb-tab__icon--left"
        :class="statusClass"
      />
      {{ symbol }}
    </div>
    <app-tab-window
      :id="id"
      ref="tabWindow"
      :is-open="isOpen"
      :child-component="childComponent"
      @status-update="newStatus => (status = newStatus)"
    />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import AppTabWindow from './AppTabWindow'
import tabWindowState from '@/enums/tabWindowState'

export default {
  name: 'AppTab',
  components: {
    AppTabWindow
  },
  props: {
    id: {
      type: Number,
      required: true
    },
    isStatic: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true
    },
    childComponent: {
      type: String,
      required: true
    },
    tabMounted: {
      type: Function,
      default: null,
      required: false
    }
  },
  data() {
    return {
      status: tabWindowState.IDLE,
      isOpen: false,
      isBound: false,
      isMouseOver: false
    }
  },
  computed: {
    displayTabPreview() {
      return this.$store.getters['app/config']('displayTabPreview')
    },
    tabButtonClass() {
      return [
        this.isBound ? 'spb-tab__button--bound' : ''
      ]
    },
    statusClass() {
      return [
        `spb-tab__icon--${this.status}`
      ]
    }
  },
  mounted() {
    this.tabMounted?.(this)
  },
  methods: {
    ...mapMutations({
      close: 'app/closeTab'
    }),
    toggleIsBound() {
      this.isBound = !this.isBound
      this.isOpen = this.isBound
    },
    showTabWindow() {
      let barScrollPosition = this.$el.parentNode.scrollTop
      let tabWindow = this.$refs.tabWindow.$el
      let toBottom = window.innerHeight - this.$el.offsetTop - tabWindow.offsetHeight

      let margin = 5
      let styleTop = this.$el.offsetTop - barScrollPosition + margin

      if (toBottom + barScrollPosition < 0) {
        styleTop = this.$el.offsetTop + toBottom - margin
      } else if (this.$el.offsetTop < barScrollPosition) {
        styleTop = margin
      }

      tabWindow.style.top = `${styleTop}px`

      this.isOpen = this.displayTabPreview || this.isBound
      this.isMouseOver = true
    },
    hideTabWindow() {
      this.isOpen = this.isBound
      this.isMouseOver = false
    }
  }
}
</script>

<style>
.spb-tab {
  height: 50px;
  width: 50px;
  padding: 5px;
  position: relative;
  color: var(--main-text-color);
  direction: ltr;
}

.spb-tab__button {
  height: 100%;
  width: 100%;
  font-size: 16px;
  background-color: var(--main-background-color);
}

.spb-tab:hover .spb-tab__button {
  background-color: var(--active-tab-background-color);
}

.spb-tab__button--bound {
  background-color: var(--active-tab-background-color);
}

.spb-tab__icon {
  position: absolute;
  height: 12px;
  width: 12px;
  top: 2px;
}

.spb-tab__icon--left {
  left: 2px;
}

.spb-tab__icon--right {
  right: 2px;
}

.spb-tab__icon--close {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/close.svg');
}

.spb-tab__icon--idle {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/idle.svg');
}

.spb-tab__icon--ok {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/ok.svg');
}

.spb-tab__icon--error {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/error.svg');
}

.spb-tab__icon--pending {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/bell.svg');
}

.spb-tab__icon--running {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/running.svg');
}
</style>
