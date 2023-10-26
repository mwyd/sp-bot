<template>
  <base-item :item="item">
    <template #modal-columns>
      <div class="spb-item__column spb-item__min-price">
        <app-input
          v-model.number="minPrice"
          class="spb-sale-guard-item__dark-input"
          :type="'number'"
          :validator="(value) => value >= 0.01 && value <= metadata.maxPrice"
          :disabled="actionsDisabled"
          :model-updated="updateTracked"
        />
      </div>
      <div class="spb-item__column spb-item__max-price">
        <app-input
          v-model.number="maxPrice"
          class="spb-sale-guard-item__dark-input"
          :type="'number'"
          :validator="(value) => value >= metadata.minPrice"
          :disabled="actionsDisabled"
          :model-updated="updateTracked"
        />
      </div>
      <div class="spb-item__column spb-item__watch">
        <button
          class="spb-button spb--font-size-small"
          :class="updateButtonClass"
          :disabled="actionsDisabled"
          @click="toggleTracked"
        >
          {{ metadata.tracked ? "stop" : "start" }}
        </button>
      </div>
    </template>
    <template #modal-statistics>
      <div
        v-if="metadata.createdAt"
        class="spb-item__stat"
      >
        Watched for
        <span class="spb--text-green">{{ createdAtDays }}</span>
      </div>
    </template>
  </base-item>
</template>

<script>
import { mapActions } from "vuex";
import BaseItem from "./BaseItem";
import actionMixin from "@/mixins/actionMixin";
import AppInput from "@/components/ui/AppInput";

export default {
  name: "SaleGuardItem",
  components: {
    BaseItem,
    AppInput,
  },
  mixins: [actionMixin],
  props: {
    item: {
      type: Object,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
  },
  computed: {
    updateButtonClass() {
      return [this.metadata.tracked ? "spb-button--red" : "spb-button--green"];
    },
    createdAtDays() {
      const days = Math.floor(
        (Date.now() - new Date(this.metadata.createdAt)) /
          (60 * 60 * 24 * 1000),
      );

      return days < 1 ? "< 1 day" : days === 1 ? "1 day" : `${days} days`;
    },
    minPrice: {
      get() {
        return this.metadata.minPrice;
      },
      set(value) {
        this.$store.commit("saleGuard/setItemMinPrice", {
          id: this.item.id,
          minPrice: value,
        });
      },
    },
    maxPrice: {
      get() {
        return this.metadata.maxPrice;
      },
      set(value) {
        this.$store.commit("saleGuard/setItemMaxPrice", {
          id: this.item.id,
          maxPrice: value,
        });
      },
    },
  },
  methods: {
    ...mapActions({
      startTrack: "saleGuard/startTrack",
      stopTrack: "saleGuard/stopTrack",
    }),
    updateTracked() {
      if (!this.metadata.tracked) {
        return;
      }

      const promise = this.$store.dispatch("saleGuard/updateTracked", {
        id: this.metadata.databaseId,
        data: {
          shadowpayOfferId: this.item.id,
          minPrice: this.metadata.minPrice,
          maxPrice: this.metadata.maxPrice,
        },
      });

      this.disableActions(promise);
    },
    toggleTracked() {
      const promise = this.metadata.tracked
        ? this.stopTrack({
            id: this.metadata.databaseId,
            showAlert: true,
          })
        : this.startTrack({
            hashName: this.item._conduit_hash_name,
            shadowpayOfferId: this.item.id,
            minPrice: this.metadata.minPrice,
            maxPrice: this.metadata.maxPrice,
          });

      this.disableActions(promise);
    },
  },
};
</script>

<style>
.spb-sale-guard-item__dark-input {
  background-color: var(--alternative-dark-background-color);
}

.spb-item__min-price,
.spb-item__max-price {
  min-width: 120px;
}

.spb-item__min-price > .spb-input,
.spb-item__max-price > .spb-input {
  width: 80%;
}

.spb-item__watch {
  min-width: 80px;
}
</style>
