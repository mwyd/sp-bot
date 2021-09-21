<template>
    <div 
        class="spb-alert spb--rounded-small spb--font-weight-medium spb--font-size-medium spb--flex spb--cursor-pointer"
        :class="alertClass"
        @click="deleteAlert(uuid)"
    >
        <div 
            class="spb-alert__icon spb--background-image-center"
            :class="iconClass"
        >
        </div>
        <div class="spb-alert__message" v-html="message"></div>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
    name: 'AppAlert',
    props: {
        uuid: {
            type: String,
            required: true
        },
        type: String,
        message: String
    },
    computed: {
        ...mapState({
            alertTypes: state => state.app.alertTypes
        }),
        alertClass() {
            return [
                `spb-alert--${this.type}`
            ]
        },
        iconClass() {
            return [
                `spb-alert__icon--${this.type}`
            ]
        }
    },
    methods: {
        ...mapMutations({
            deleteAlert: 'app/deleteAlert'
        })
    }
}
</script>

<style scoped>
.spb-alert {
    width: 100%;
    min-height: 40px;
    margin-bottom: 4px;
    color: var(--main-text-color);
    padding: 4px 12px;
    grid-gap: 12px;
}

.spb-alert__icon {
    height: 20px;
    flex: 0 0 20px;
    background-size: 100%;
}

.spb-alert__message {
    width: 100%;
}

.spb-alert--info {
    background-color: var(--active-color);
}

.spb-alert--success {
    background-color: var(--accepted-color);
}

.spb-alert--error {
    background-color: var(--cancelled-color);
}

.spb-alert__icon--success {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/info.svg');
}

.spb-alert__icon--info {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/idle.svg');
}

.spb-alert__icon--error {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/error.svg');
}
</style>