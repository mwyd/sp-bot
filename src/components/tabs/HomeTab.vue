<template>
  <div class="spb-home">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">
      Home
    </h3>
    <app-multiple-switch
      :options="Object.values(views)"
      :selected="currentView"
      @option-update="updateView"
    />
    <div class="spb-option">
      <div class="spb--flex spb-option__title">
        <span>Manage</span>
        <span>{{ itemsValue }}</span>
      </div>
      <div class="spb--flex">
        <app-input
          v-model="search"
          class="spb-home__search"
          :type="'text'"
          :placeholder="'Search...'"
        />
        <select
          v-model="sortModel"
          class="spb-home__sort-by spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
        >
          <option
            v-for="[key, sort] in itemSortBy"
            :key="'sort-' + key"
            :value="key"
          >
            {{ sort.name }}
          </option>
        </select>
        <div
          class="spb-sort-dir spb--rounded-small spb--background-image-center spb--cursor-pointer"
          :class="sortDirClass"
          @click="sortDirAsc = !sortDirAsc"
        />
      </div>
    </div>
    <div class="spb-home__items-header">
      <div class="spb-item__column spb-item__name">
        Item
      </div>
      <div class="spb-item__column spb-item__price">
        Price
      </div>
      <div class="spb-item__column spb-item__status">
        Status
      </div>
      <div class="spb-item__column spb-item__date">
        {{ currentView === views.ACTIVE ? "Buy" : "Date" }}
      </div>
      <div class="spb-item__column spb-item__info">
        Info
      </div>
    </div>
    <div class="spb-home__items">
      <div
        v-show="currentView === views.ACTIVE"
        class="spb-home__items-active"
      >
        <home-item
          v-for="item in filteredItems(botItemType.TO_CONFIRM)"
          :key="'item-' + item.id"
          :type="botItemType.TO_CONFIRM"
          :item="item"
        />
      </div>
      <div
        v-show="currentView === views.BUY_HISTORY"
        class="spb-home__items-buy-history"
      >
        <home-item
          v-for="item in filteredItems(botItemType.PENDING)"
          :key="'item-' + item.id"
          :type="botItemType.PENDING"
          :item="item"
        />
        <home-item
          v-for="item in filteredItems(botItemType.FINISHED)"
          :key="'item-' + item.id"
          :type="botItemType.FINISHED"
          :item="item"
        />
      </div>
    </div>
    <div class="spb-home__footer spb--font-size-medium">
      <div class="spb--flex spb-home__control">
        <div
          class="spb-home__control-icon spb--background-image-center spb-home__control-items"
        />
        <div class="spb-home__control-name">
          {{ itemsCounter }} Items
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import tabWindowState from "@/enums/tabWindowState";
import HomeItem from "@/components/item/HomeItem";
import AppInput from "@/components/ui/AppInput";
import AppMultipleSwitch from "@/components/ui/AppMultipleSwitch";
import itemFilterMixin from "@/mixins/itemFilterMixin";
import botItemType from "@/enums/botItemType";
import itemSortType from "@/enums/itemSortType";
import targetMarketType from "@/enums/targetMarketType";

const views = Object.freeze({
  ACTIVE: "Active",
  BUY_HISTORY: "Buy history",
});

export default {
  name: "HomeTab",
  components: {
    HomeItem,
    AppInput,
    AppMultipleSwitch,
  },
  mixins: [itemFilterMixin],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  emits: ["statusUpdate"],
  data() {
    return {
      botItemType,
      views,
      currentView: views.ACTIVE,
      sortModel: itemSortType.STEAM_DISCOUNT,
    };
  },
  computed: {
    ...mapState({
      finishedItems: (state) => state.bots.items.finished,
    }),
    ...mapGetters({
      toConfirmItems: "bots/toConfirmItems",
      pendingItems: "bots/pendingItems",
    }),
    itemsCounter() {
      return this.currentView === this.views.ACTIVE
        ? this.toConfirmItems.length
        : this.pendingItems.length + this.finishedItems.length;
    },
    appLoaded() {
      return this.$store.state.app.loaded;
    },
    targetMarket() {
      return this.$store.getters["app/config"]("targetMarket");
    },
    itemsValue() {
      if (this.currentView !== views.BUY_HISTORY) {
        return "";
      }

      const pendingValue = this.pendingItems.reduce(
        (a, item) => a + item.price_market_usd,
        0,
      );

      let acceptedValue = 0;
      let finishedValue = 0;

      for (const item of this.finishedItems) {
        if (item.state === "finished") {
          acceptedValue += item.price_market_usd;
        }

        finishedValue += item.price_market_usd;
      }

      return (
        "$ " +
        acceptedValue.toFixed(2) +
        " / " +
        (pendingValue + finishedValue).toFixed(2)
      );
    },
  },
  watch: {
    pendingItems(items) {
      if (this.currentView !== this.views.BUY_HISTORY && items.length > 0) {
        this.$emit("statusUpdate", tabWindowState.PENDING);
      }
    },
    appLoaded(value) {
      if (value) {
        this.sortModel =
          this.targetMarket === targetMarketType.BUFF
            ? itemSortType.BUFF_DISCOUNT
            : itemSortType.STEAM_DISCOUNT;
      }
    },
  },
  methods: {
    updateView(view) {
      if (view === this.views.BUY_HISTORY) {
        this.clearPendingStatus();
      }

      this.currentView = view;
    },
    filteredItems(type) {
      let items = [];

      switch (type) {
        case botItemType.TO_CONFIRM:
          items = this.toConfirmItems;
          break;

        case botItemType.PENDING:
          items = this.pendingItems;
          break;

        case botItemType.FINISHED:
          items = this.finishedItems;
          break;
      }

      return items
        .filter((item) =>
          item._search_steam_hash_name.includes(this.search.toLowerCase()),
        )
        .sort(this.itemSortBy.get(this.sortModel).callback(this.sortDirAsc));
    },
    clearPendingStatus() {
      if (this.$parent.$parent.status === tabWindowState.PENDING) {
        this.$emit("statusUpdate", tabWindowState.IDLE);
      }
    },
  },
};
</script>

<style scoped>
.spb-home {
  width: 80vw;
  min-width: 720px;
  max-width: 1024px;
}

.spb-home__search {
  width: 100%;
  margin-right: 4px;
}

.spb-home__sort-by {
  background-color: var(--secondary-background-color);
  margin: 0 4px;
  width: 150px;
  height: 32px;
  flex-shrink: 0;
}

.spb-home__items-header {
  display: flex;
  padding-top: 6px;
}

.spb-home__items {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.spb-home__footer {
  padding-top: 10px;
  text-align: right;
}

.spb-home__control {
  display: inline-flex;
  margin: 0 8px;
  color: inherit;
  font-weight: normal;
}

.spb-home__control-icon {
  margin-right: 4px;
  height: 16px;
  width: 16px;
}

.spb-home__control-items {
  background-image: url("chrome-extension://__MSG_@@extension_id__/assets/img/pack.svg");
}
</style>
