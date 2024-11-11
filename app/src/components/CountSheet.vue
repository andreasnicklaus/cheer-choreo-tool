<template>
  <b-table-simple
    lang="de"
    striped
    hover
    :sticky-header="stickyHeader && tableHeight"
    head-variant="light"
    small
    :fixed="fixed"
    :style="{
      placeItems: 'center',
      fontSize: fontSize ? fontSize + 'px' : null,
    }"
    class="text-center"
  >
    <b-thead head-variant="light">
      <b-tr>
        <b-th
          v-for="field in ['Achter', '1', '2', '3', '4', '5', '6', '7', '8']"
          :key="field"
        >
          {{ field }}
        </b-th>
      </b-tr>
    </b-thead>
    <b-tbody>
      <b-tr v-for="(acht, i) in achter" :key="i" :style="{ height: '1px' }">
        <b-td
          v-for="label in ['achter', '1', '2', '3', '4', '5', '6', '7', '8']"
          :key="label"
          :style="{
            height: 'inherit',
            verticalAlign: 'middle',
            // border: 'none',
          }"
        >
          <span v-if="label == 'achter'">
            {{ acht[label] + 1 }}
          </span>
          <b-button
            v-else-if="i * 8 + parseInt(label) <= choreo.counts"
            :disabled="!interactive"
            class="p-1 py-2"
            squared
            :style="{
              wordBreak: 'break-word',
              hyphens: 'auto',
              minWidth: '50px',
              height: '100%',
              fontSize: fontSize ? fontSize + 'px' : null,
              color:
                Math.floor(count / 8) == i && count % 8 == label - 1
                  ? 'white'
                  : null,
            }"
            block
            @click="() => setCount(i, parseInt(label - 1))"
            @dblclick="() => $emit('openCreateHitModal')"
            :variant="
              Math.floor(count / 8) == i && count % 8 == label - 1
                ? 'primary'
                : 'outline-primary'
            "
          >
            <span v-if="acht[label].length > 0">
              <p class="mb-0" v-for="hit in acht[label]" :key="hit.name">
                {{ hit.name }}
              </p>
            </span>
            <span v-else>-</span>
          </b-button>
        </b-td>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
export default {
  name: "CountSheet",
  props: {
    count: {
      type: Number,
      required: true,
    },
    choreo: {
      type: Object,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
    stickyHeader: {
      type: Boolean,
      default: true,
    },
    fontSize: {
      type: Number,
    },
    startCount: {
      type: Number,
      default: 0,
    },
    fixed: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    setCount(achter, count) {
      this.$emit("setCounter", achter * 8 + count);
    },
    findActionsForCount(count) {
      return this.choreo.Hits.filter((a) => {
        return a.count == count;
      });
    },
  },
  computed: {
    achter() {
      if (!this.choreo) return [];
      else {
        const achterLength = Math.ceil(this.choreo.counts / 8);
        const achter = new Array(achterLength).fill(null).map((_, i) => ({
          achter: Math.floor(this.startCount / 8) + i,
          1: this.findActionsForCount(this.startCount + i * 8 + 0),
          2: this.findActionsForCount(this.startCount + i * 8 + 1),
          3: this.findActionsForCount(this.startCount + i * 8 + 2),
          4: this.findActionsForCount(this.startCount + i * 8 + 3),
          5: this.findActionsForCount(this.startCount + i * 8 + 4),
          6: this.findActionsForCount(this.startCount + i * 8 + 5),
          7: this.findActionsForCount(this.startCount + i * 8 + 6),
          8: this.findActionsForCount(this.startCount + i * 8 + 7),
        }));
        return achter;
      }
    },
    tableHeight() {
      return window.innerHeight - 30 + "px";
    },
  },
};
</script>

<style lang="scss" scoped>
td {
  padding: 0;
}
</style>
