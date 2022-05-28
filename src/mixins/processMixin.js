import processStateType from '@/enums/processStateType'

export default {
    data() {
        return {
            processStates: processStateType,
            processState: 3
        }
    },
    computed: {
        isProcessIdle() {
            return this.processState == this.processStates.IDLE
        },
        isProcessRunning() {
            return this.processState == this.processStates.RUNNING
        },
        isProcessTerminating() {
            return this.processState == this.processStates.TERMINATING
        },
        isProcessTerminated() {
            return this.processState == this.processStates.TERMINATED
        },
        toggleProcessButtonClass() {
            return [
                !this.isProcessTerminated ? 'spb-button--red' : 'spb-button--green'
            ]
        }
    },
    methods: {
        setProcessIdle() {
            this.processState = this.processStates.IDLE
        },
        setProcessRunning() {
            this.processState = this.processStates.RUNNING
        },
        setProcessTerminating() {
            this.processState = this.processStates.TERMINATING
        },
        setProcessTerminated() {
            this.processState = this.processStates.TERMINATED
        }
    }
}