<template>
  <base-item
    :item="item"
    :class="stateClass"
  >
    <template #modal-columns>
      <div class="spb-item__column spb-item__status">
        {{ item.state }}
      </div>
      <div class="spb-item__column spb-item__date">
        <button
          v-if="type === botItemType.TO_CONFIRM"
          class="spb-button spb--font-size-small spb-button--green"
          :disabled="actionsDisabled"
          @click="disableActions(buyItem(item))"
        >
          Buy now
        </button>
        <span v-else>{{ timeBought }}</span>
      </div>
    </template>
    <template #modal-statistics>
      <div
        v-if="item.inspect_url"
        class="spb-item__stat spb--cursor-pointer"
      >
        <a
          target="_blank"
          class="spb--link"
          :href="
            steamMarket.USER_PROFILE + getItemOwnerSteamId(item.inspect_url)
          "
        >
          {{ friendOwner ? friendOwner + "'s" : "Owner's" }}
          <span class="spb--text-green"> steam </span>
        </a>
      </div>
    </template>
  </base-item>
</template>

<script>
import { mapActions } from "vuex";
import { getItemOwnerSteamId } from "@/resources/marketItem";
import actionMixin from "@/mixins/actionMixin";
import BaseItem from "./BaseItem";
import DateFormat from "dateformat";
import botItemType from "@/enums/botItemType";
import { steamMarket } from "@/config";

export default {
  name: "HomeItem",
  components: {
    BaseItem,
  },
  mixins: [actionMixin],
  props: {
    type: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      steamMarket,
      botItemType,
      friendOwner: this.$store.getters["friendManager/itemOwner"](
        this.item.user_id,
      ),
    };
  },
  computed: {
    stateClass() {
      return [
        this.type !== botItemType.TO_CONFIRM
          ? `spb-item__status--${this.item.state}`
          : "",
      ];
    },
    timeBought() {
      return DateFormat(this.item._time_bought, "yyyy-mm-dd H:MM:ss");
    },
  },
  methods: {
    ...mapActions({
      buyItem: "bots/buyItem",
    }),
    getItemOwnerSteamId,
  },
};
</script>

<style>
.spb-item__status {
  min-width: 90px;
}

.spb-item__date {
  min-width: 150px;
}

.spb-item__status--active {
  border-left: 2px solid var(--active-color);
}

.spb-item__status--cancelled {
  border-left: 2px solid var(--cancelled-color);
}

.spb-item__status--finished {
  border-left: 2px solid var(--accepted-color);
}
</style>
