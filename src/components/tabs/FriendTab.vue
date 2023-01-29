<template>
  <div class="spb-friend-manager">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">
      Friend Manager
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
      <span class="spb-option__description">Select friend</span>
      <select
        v-model="friendModel"
        class="spb-friend-manager__friend-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
      >
        <option
          v-for="[friendId, userFriend] in sortedFriends(true)"
          :key="'friend-' + friendId"
          :value="friendId"
        >
          {{ userFriend.name }}
        </option>
      </select>
    </div>
    <div class="spb-friend-manager__options">
      <div class="spb-option">
        <span class="spb-option__description">Shadowpay id</span>
        <app-input
          v-model.number="friend.shadowpayUserId"
          :type="'number'"
          :placeholder="'Enter id...'"
        />
      </div>
      <div class="spb-option">
        <span class="spb-option__description">Name</span>
        <app-input
          v-model="friend.name"
          :type="'text'"
          :placeholder="'Enter name...'"
        />
      </div>
    </div>
    <div class="spb-friend-manager__buttons-wrapper">
      <div v-if="currentView === views.ADD">
        <button
          class="spb-button spb-button--green"
          :disabled="actionsDisabled"
          @click="disableActions(addFriend(friend))"
        >
          add
        </button>
      </div>
      <div
        v-else
        class="spb--flex"
      >
        <button
          class="spb-friend-manager__button-update spb-button spb-button--green"
          :disabled="friendModel === 0 || actionsDisabled"
          @click="disableActions(updateFriend({id: friendModel, friend: friend}))"
        >
          update
        </button>
        <button
          class="spb-friend-manager__button-delete spb-button spb-button--red"
          :disabled="friendModel === 0 || actionsDisabled"
          @click="disableActions(deleteFriend(friendModel).then(resetFriendModel))"
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
import actionMixin from '@/mixins/actionMixin'
import AppInput from '@/components/ui/AppInput'
import AppMultipleSwitch from '@/components/ui/AppMultipleSwitch'

const views = Object.freeze({
  ADD: 'Add',
  MANAGE: 'Manage'
})

export default {
  name: 'FriendTab',
  components: {
    AppInput,
    AppMultipleSwitch
  },
  mixins: [actionMixin],
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
      currentView: views.ADD,
      friendModel: 0,
      friend: { ...this.getFriend(0) }
    }
  },
  computed: {
    ...mapState({
      friendsLoaded: state => state.friendManager.loaded
    })
  },
  watch: {
    friendModel(value) {
      this.friend = { ...this.getFriend(value) }
    },
    currentView() {
      this.friendModel = 0
    },
    friendsLoaded(value) {
      this.$emit('statusUpdate', value ? tabWindowState.OK : tabWindowState.ERROR)
    }
  },
  methods: {
    ...mapActions({
      addFriend: 'friendManager/addFriend',
      updateFriend: 'friendManager/updateFriend',
      deleteFriend: 'friendManager/deleteFriend'
    }),
    sortedFriends(sortAsc = true) {
      return this.$store.getters['friendManager/sortedFriends'](sortAsc)
    },
    getFriend(id) {
      return this.$store.getters['friendManager/friend'](id)
    },
    resetFriendModel(success) {
      if (success) {
        this.friendModel = 0
      }
    }
  }
}
</script>

<style scoped>
.spb-friend-manager {
  display: flex;
  flex-direction: column;
  width: 250px;
  position: relative;
}

.spb-friend-manager__friend-select {
  background-color: var(--secondary-background-color);
  height: 32px;
}

.spb-friend-manager__buttons-wrapper {
  margin-top: 8px;
}

.spb-friend-manager__button-update {
  margin-right: 4px;
}

.spb-friend-manager__button-delete {
  width: auto;
  min-width: 70px;
  margin-left: 4px;
}
</style>