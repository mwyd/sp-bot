<template>
    <div class="spb-friend-manager">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Friend Manager</h3>
        <div class="spb-friend-manager__views-wrapper">
            <div class="spb-friend-manager__views spb--cursor-pointer spb--rounded-small spb--flex">
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
            <span class="spb-option__description">Select friend</span>
            <select 
                class="spb-input-field spb-input-field--ok spb--font-size-medium spb--rounded-small"
                v-model="currentFriendIdModel"
            >
                <option 
                    v-for="pair in friends" 
                    :key="'friend-' + pair[0]" 
                    :value="pair[0]"
                >
                    {{ pair[1].name }}
                </option>
            </select>
        </div>
        <div class="spb-friend-manager__options">
            <div class="spb-option">
                <span class="spb-option__description">Shadowpay id</span>
                <InputField 
                    v-model.number="currentFriend.shadowpay_id"
                    :type="'number'"
                >
                </InputField>
            </div>  
            <div class="spb-option">
                <span class="spb-option__description">Name</span>
                <InputField 
                    v-model.number="currentFriend.name"
                    :type="'text'" 
                >
                </InputField>
            </div>
        </div>
        <div class="spb-friend-manager__buttons-wrapper">
            <div v-if="currentView == views.ADD">
                <button 
                    class="spb-button spb-button--green" 
                    @click="addFriend(currentFriend)"
                >
                add
                </button>
            </div>
            <div v-else class="spb--flex">
                <button 
                    class="spb-friend-manager__button-update spb-button spb-button--green" 
                    :disabled="currentFriendId == 0"
                    @click="updateFriend({
                        id: currentFriendId,
                        friend: currentFriend
                    })"
                >
                update
                </button>
                <button 
                    class="spb-friend-manager__button-delete spb-button spb-button--red" 
                    :disabled="currentFriendId == 0"
                    @click="deleteFriend(currentFriendId)"
                >
                delete
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import InputField from './InputField'

export default {
    name: 'FriendManager',
    components: {
        InputField
    },
    emits: ['statusUpdate'],
    data() {
        return {
            views: Object.freeze({
                ADD: 'add',
                MANAGE: 'manage'
            }),
            currentView: 'add',
            currentFriendId: 0,
            currentFriend: {...this.getFriend(0)}
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
    methods: {
        ...mapActions({
            addFriend: 'friendManager/addFriend',
            updateFriend: 'friendManager/updateFriend'
        }),
        viewClass(view) {
            const className = 'spb-friend-manager__view spb--rounded-small'
            return className + (this.currentView == view ? ` spb-friend-manager__view--active` : '')
        },
        getFriend(id) {
            return this.$store.getters['friendManager/friend'](id)
        },
        deleteFriend(id) {
            this.$store.dispatch('friendManager/deleteFriend', id)
                .then(({success}) => {
                    if(success) {
                        const {length} = this.friendIds
                        if(length > 0) this.currentFriendIdModel = this.friendIds[length - 1]
                    }
                })
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

.spb-friend-manager__views-wrapper {
    padding: 10px 0px;
}

.spb-friend-manager__views {
    background-color: var(--alternative-background-color);
}

.spb-friend-manager__view {
    text-align: center;
    width: 100%;
}

.spb-friend-manager__view--active {
    background-color: var(--secondary-background-color);
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