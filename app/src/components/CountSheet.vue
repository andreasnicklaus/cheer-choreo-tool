<template>
  <b-table-simple
    striped
    hover
    :sticky-header="tableHeight"
    head-variant="light"
    small
    :style="{
      placeItems: 'center',
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
          :style="{ height: 'inherit', verticalAlign: 'middle' }"
        >
          <span v-if="label == 'achter'">
            {{ acht[label] + 1 }}
          </span>
          <b-button
            v-else
            :style="{
              minWidth: '50px',
              height: '100%',
              color:
                Math.floor(count / 8) == i && count % 8 == label - 1
                  ? 'white'
                  : null,
            }"
            block
            @click="() => setCount(i, parseInt(label - 1))"
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
      if (!this.choreo) return [null];
      else {
        const achterLength = Math.ceil(this.choreo.counts / 8);
        const achter = new Array(achterLength).fill(null).map((_, i) => ({
          achter: i,
          1: this.findActionsForCount(i * 8 + 0),
          2: this.findActionsForCount(i * 8 + 1),
          3: this.findActionsForCount(i * 8 + 2),
          4: this.findActionsForCount(i * 8 + 3),
          5: this.findActionsForCount(i * 8 + 4),
          6: this.findActionsForCount(i * 8 + 5),
          7: this.findActionsForCount(i * 8 + 6),
          8: this.findActionsForCount(i * 8 + 7),
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
