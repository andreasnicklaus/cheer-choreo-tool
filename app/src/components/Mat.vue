<template>
  <svg
    ref="svgCanvas"
    class="svgCanvas"
    :height="height"
    :width="width"
    mlns="http://www.w3.org/2000/svg"
    :style="{
      border: '1px solid #000000',
      backgroundColor: '#e5e5f7',
      backgroundImage:
        'linear-gradient(to right, #444cf766 5px, #e5e5f744 5px )',
      backgroundSize: width / 7 + 'px 100%',
      backgroundRepeat: 'repeat',
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-khtml-user-select': 'none',
      '-moz-user-select': 'none',
      '-ms-user-select': 'none',
      'user-select': 'none',
    }"
    @mouseleave="mouseLeave"
  >
    <circle
      v-for="member in currentPositions"
      :key="'c' + member.id"
      :id="`member-${member.id}`"
      :ref="`member-${member.id}`"
      :cx="member.x"
      :cy="member.y"
      :r="dotRadius"
      :stroke="member.color"
      stroke-width="2"
      :fill="
        selectedMember && member.id == selectedMember.id
          ? member.color + (member.color.length == 4 ? '2' : '22')
          : member.color + (member.color.length == 4 ? '5' : '55')
      "
      @mousedown="() => mouseEnter(member)"
      @mouseup="mouseLeave"
      :style="{
        opacity: selectedMember && member.id == selectedMember.id ? 0.7 : 1,
        transition: !selectedMember ? `all ${transitionMs}ms` : null,
        transitionTimingFunction: 'linear',
      }"
    ></circle>
    <text
      v-for="member in currentPositions"
      :key="'t' + member.id"
      :id="'t' + member.id"
      text-anchor="middle"
      alignment-baseline="central"
      :x="member.x"
      :y="member.y"
      :style="{
        'pointer-events': 'none',
        opacity: transitionRunning ? 0 : 1,
        display:
          selectedMember && selectedMember.id == member.id ? 'none' : null,
        transition:
          transitionRunning || selectedMember ? null : `all ${transitionMs}ms`,
      }"
    >
      {{ member.abbreviation || member.nickname || member.name }}
    </text>
    <text
      v-for="(_, i) in Array(7)"
      :key="i"
      text-anchor="middle"
      alignment-baseline="central"
      :y="15"
      :x="(width / 7) * (i + 1) - width / 7 / 2"
      :style="{
        'pointer-events': 'none',
        fill: '#6c757d !important',
      }"
    >
      {{ i + 1 }}
    </text>
  </svg>
</template>

<script>
export default {
  name: "MatComponent",
  data: () => ({
    selectedMember: null,
    snappingDistance: 10,
  }),
  props: {
    currentPositions: {
      type: Array,
      default: () => [],
    },
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 500,
    },
    dotRadius: {
      type: Number,
      default: 20,
    },
    snapping: {
      type: Boolean,
      default: true,
    },
    transitionRunning: {
      type: Boolean,
      default: false,
    },
    transitionMs: {
      type: Number,
      default: 1000,
    },
  },
  methods: {
    mouseEnter(member) {
      this.selectedMember = member;
      // this.$refs[`member-${member.id}`][0].addEventListener(
      this.$refs[`svgCanvas`].addEventListener(
        "mousemove",
        this.mouseMove,
        false
      );
    },
    mouseLeave() {
      if (!this.selectedMember) return;
      this.$refs[`svgCanvas`].removeEventListener("mousemove", this.mouseMove);
      this.selectedMember = null;
    },
    mouseMove(event) {
      if (!this.selectedMember) return;

      const { x: canvasX, y: canvasY } =
        this.$refs.svgCanvas.getBoundingClientRect();

      const m = this.currentPositions.find(
        (m) => m.id == this.selectedMember.id
      );

      let xNew = event.clientX - canvasX;
      let yNew = event.clientY - canvasY;

      if (xNew == m.x && yNew == m.y) return;

      if (this.snapping) {
        const otherMembers = this.currentPositions.filter(
          (m) => m.id != this.selectedMember.id
        );

        if (otherMembers.length > 0) {
          const closestX = otherMembers.sort(
            (a, b) => Math.abs(a.x - xNew) - Math.abs(b.x - xNew)
          )[0].x;
          if (Math.abs(closestX - xNew) < this.snappingDistance)
            xNew = closestX;

          const closestY = otherMembers.sort(
            (a, b) => Math.abs(a.y - yNew) - Math.abs(b.y - yNew)
          )[0].y;
          if (Math.abs(closestY - yNew) < this.snappingDistance)
            yNew = closestY;
        }
      }

      this.$emit("positionChange", this.selectedMember.id, xNew, yNew);
    },
  },
};
</script>
