import processStateType from "@/enums/processStateType";

export default {
  data() {
    return {
      processState: processStateType.TERMINATED,
    };
  },
  computed: {
    isProcessIdle() {
      return this.processState === processStateType.IDLE;
    },
    isProcessRunning() {
      return this.processState === processStateType.RUNNING;
    },
    isProcessTerminating() {
      return this.processState === processStateType.TERMINATING;
    },
    isProcessTerminated() {
      return this.processState === processStateType.TERMINATED;
    },
  },
  methods: {
    setProcessIdle() {
      this.processState = processStateType.IDLE;
    },
    setProcessRunning() {
      this.processState = processStateType.RUNNING;
    },
    setProcessTerminating() {
      this.processState = processStateType.TERMINATING;
    },
    setProcessTerminated() {
      this.processState = processStateType.TERMINATED;
    },
  },
};
