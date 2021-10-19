<template>
    <div class="spb-friend-manager">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Friend Manager</h3>
        <app-multiple-switch
            :options="Object.values(views)"
            :selected="currentView"
            @optionUpdate="view => currentView = view"
        >
        </app-multiple-switch>
        <div v-show="currentView == views.MANAGE" class="spb-option">
            <span class="spb-option__description">Select friend</span>
            <select 
                class="spb-friend-manager__friend-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
                v-model="currentFriendIdModel"
            >
                <option 
                    v-for="[id, friend] in sortedFriends(true)" 
                    :key="'friend-' + id" 
                    :value="id"
                >
                    {{ friend.name }}
                </option>
            </select>
        </div>
        <div class="spb-friend-manager__options">
            <div class="spb-option">
                <span class="spb-option__description">Shadowpay id</span>
                <app-input 
                    v-model.number="currentFriend.shadowpayUserId"
                    :type="'number'"
                    :placeholder="'Enter id...'"
                >
                </app-input>
            </div>  
            <div class="spb-option">
                <span class="spb-option__description">Name</span>
                <app-input 
                    v-model="currentFriend.name"
                    :type="'text'" 
                    :placeholder="'Enter name...'"
                >
                </app-input>
            </div>
        </div>
        <div class="spb-friend-manager__buttons-wrapper">
            <div v-if="currentView == views.ADD">
                <button 
                    class="spb-button spb-button--green" 
                    :disabled="actionsDisabled"
                    @click="disableActions(addFriend(currentFriend))"
                >
                add
                </button>
            </div>
            <div v-else class="spb--flex">
                <button 
                    class="spb-friend-manager__button-update spb-button spb-button--green" 
                    :disabled="currentFriendId == 0 || actionsDisabled"
                    @click="disableActions(updateFriend({id: currentFriendId, friend: currentFriend}))"
                >
                update
                </button>
                <button 
                    class="spb-friend-manager__button-delete spb-button spb-button--red" 
                    :disabled="currentFriendId == 0 || actionsDisabled"
                    @click="disableActions(deleteFriend(currentFriendId).then(shiftCurrentFriendIdModel))"
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
    name: 'FriendManager',
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
            currentFriendId: 0,
            currentFriend: {...this.getFriend(0)}
        }
    },
    computed: {
        ...mapState({
            friends: state => state.friendManager.friends,
            friendsLoaded: state => state.friendManager.loaded,
            tabStates: state => state.app.tabStates
        }),
        ...mapGetters({
            friendIds: 'friendManager/friendIds'
        }),
        currentFriendIdModel: {
            get() {
                return this.currentFriendId
            },
            set(value) {
                this.currentFriendId = value
                this.currentFriend = {...this.getFriend(this.currentFriendId)}
            }
        }
    },
    watch: {
        currentView() {
            this.currentFriendIdModel = 0
        },
        friendsLoaded(value) {
            this.$emit('statusUpdate', value ? this.tabStates.OK : this.tabStates.ERROR)
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
        shiftCurrentFriendIdModel({success}) {
            if(success) {
                const {length} = this.friendIds
                if(length > 0) this.currentFriendIdModel = this.friendIds[length - 1]
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