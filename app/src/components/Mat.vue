<template>
  <b-skeleton-wrapper :loading="!currentPositions">
    <template #loading>
      <b-skeleton :width="width + 'px'" :height="height + 'px'"> </b-skeleton>
    </template>
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
        v-for="position in positions || currentPositions"
        :id="'c' + position.MemberId"
        :key="'c' + position.MemberId"
        :r="dotRadius"
        :stroke="
          teamMembers.find((tm) => tm.id == position.MemberId)
            .ChoreoParticipation.color
        "
        stroke-width="2"
        :fill="
          selectedMemberId && position.Member.id == selectedMemberId.id
            ? teamMembers.find((tm) => tm.id == position.MemberId)
                .ChoreoParticipation.color + '22'
            : teamMembers.find((tm) => tm.id == position.MemberId)
                .ChoreoParticipation.color + '55'
        "
        @mousedown="() => mouseEnter(position.MemberId)"
        @mouseup="mouseLeave"
        :style="{
          opacity:
            selectedMemberId && position.Member.id == selectedMemberId.id
              ? 0.7
              : 1,
          cx: (position.x * width) / 100 + 'px',
          cy: (position.y * height) / 100 + 'px',
        }"
      ></circle>
      <text
        v-for="position in positions || currentPositions"
        :id="'t' + position.MemberId"
        :key="'t' + position.MemberId"
        text-anchor="middle"
        alignment-baseline="central"
        :font-size="dotRadius / 20 + 'em'"
        :transform="`matrix(1,0,0,1,${(position.x * width) / 100},${
          (position.y * height) / 100
        })`"
        :style="{
          'pointer-events': 'none',
        }"
      >
        {{
          position.Member.abbreviation ||
          position.Member.nickname ||
          position.Member.name
        }}
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
  </b-skeleton-wrapper>
</template>

<script>
import gsap from "gsap";

export default {
  name: "MatComponent",
  data: () => ({
    selectedMemberId: null,
    snappingDistance: 2,
    positions: null,
  }),
  props: {
    currentPositions: {
      type: Array,
      default: () => [],
    },
    teamMembers: {
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
    transitionMs: {
      type: Number,
      default: 1000,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.positions = this.currentPositions;
  },
  methods: {
    mouseEnter(member) {
      if (!this.interactive) return;
      this.selectedMemberId = member;
      this.$refs[`svgCanvas`].addEventListener(
        "mousemove",
        this.mouseMove,
        false
      );
    },
    mouseLeave() {
      if (!this.interactive) return;
      if (!this.selectedMemberId) return;
      this.$refs[`svgCanvas`].removeEventListener("mousemove", this.mouseMove);
      this.selectedMemberId = null;
    },
    mouseMove(event) {
      if (!this.selectedMemberId) return;

      const { x: canvasX, y: canvasY } =
        this.$refs.svgCanvas.getBoundingClientRect();

      const selectedPosition = this.currentPositions.find(
        (p) => p.MemberId == this.selectedMemberId
      );

      let xNew = ((event.clientX - canvasX) / this.width) * 100;
      let yNew = ((event.clientY - canvasY) / this.height) * 100;

      if (xNew == selectedPosition?.x && yNew == selectedPosition?.y) return;

      if (this.snapping) {
        const otherPositions = this.currentPositions.filter(
          (p) => p.MemberId != this.selectedMemberId
        );

        if (otherPositions.length > 0) {
          const closestX = otherPositions.sort(
            (a, b) => Math.abs(a.x - xNew) - Math.abs(b.x - xNew)
          )[0].x;
          if (Math.abs(closestX - xNew) < this.snappingDistance)
            xNew = closestX;

          const closestY = otherPositions.sort(
            (a, b) => Math.abs(a.y - yNew) - Math.abs(b.y - yNew)
          )[0].y;
          if (Math.abs(closestY - yNew) < this.snappingDistance)
            yNew = closestY;
        }
      }

      xNew = Math.round(xNew * 10) / 10;
      yNew = Math.round(yNew * 10) / 10;

      const pos = this.positions.find(
        (p) => p.MemberId == this.selectedMemberId
      );
      pos.x = xNew;
      pos.y = yNew;

      this.$emit("positionChange", this.selectedMemberId, xNew, yNew);
    },
    animatePositions(oldPositions, newPositions) {
      if (newPositions && oldPositions)
        newPositions.forEach((np) => {
          const op = oldPositions.find((p) => p.MemberId == np.MemberId);
          if (np && op) {
            gsap.fromTo(
              `#c${np.MemberId}`,
              { cx: (op.x * this.width) / 100, cy: (op.y * this.width) / 100 },
              {
                cx: (np.x * this.height) / 100,
                cy: (np.y * this.height) / 100,
                duration: this.transitionMs / 1000,
                ease: "none",
              }
            );
            gsap.fromTo(
              `#t${np.MemberId}`,
              { x: (op.x * this.width) / 100, y: (op.y * this.width) / 100 },
              {
                x: (np.x * this.height) / 100,
                y: (np.y * this.height) / 100,
                duration: this.transitionMs / 1000,
                ease: "none",
              }
            );
          }
        });
    },
  },
  watch: {
    currentPositions: {
      handler(value) {
        this.positions = value;
      },
    },
  },
};
</script>
