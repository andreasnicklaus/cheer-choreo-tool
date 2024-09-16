<template>
  <div class="matEditor">
    <p>
      <b>Achter: {{ Math.floor(count / 8) + 1 }}</b>
      <br />
      <b>Count: {{ (count % 8) + 1 }}</b>
    </p>

    <b-row>
      <b-col cols="6">
        <b-table
          :items="achter"
          :fields="['achter', '1', '2', '3', '4', '5', '6', '7', '8']"
          bordered
          striped
          sticky-header="500px"
          head-variant="light"
          small
        >
          <template #cell(achter)="data">
            <p class="m-0 mt-2">
              {{ data.value + 1 }}
            </p>
          </template>
          <template #cell(1)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(2)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(3)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(4)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(5)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(6)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(7)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
          <template #cell(8)="data">
            <b-button
              :style="{ minWidth: '50px' }"
              :variant="
                Math.floor(count / 8) == data.item.achter &&
                count % 8 == data.field.label - 1
                  ? 'primary'
                  : 'outline-primary'
              "
              block
              @click="
                () => setCount(data.item.achter, parseInt(data.field.label - 1))
              "
            >
              <span v-if="!data.value">-</span>
              <BIconMap v-else-if="data.value" />
            </b-button>
          </template>
        </b-table>
      </b-col>

      <b-col cols="6">
        <svg
          ref="svgCanvas"
          class="svgCanvas"
          height="500"
          width="500"
          mlns="http://www.w3.org/2000/svg"
          :style="{
            border: '1px solid #000000',
            backgroundColor: '#e5e5f7',
            backgroundImage:
              'linear-gradient(to right, #444cf766 5px, #e5e5f744 5px )',
            backgroundSize: '50px 100%',
            backgroundRepeat: 'repeat',
            '-webkit-touch-callout': 'none',
            '-webkit-user-select': 'none',
            '-khtml-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            'user-select': 'none',
          }"
        >
          <circle
            :id="`member-${member.id}`"
            :ref="`member-${member.id}`"
            v-for="member in currentPositions"
            :key="'c' + member.id"
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
              opacity:
                selectedMember && member.id == selectedMember.id ? 0.7 : 1,
              transition: !selectedMember ? 'all .8s' : null,
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
                selectedMember && selectedMember.id == member.id
                  ? 'none'
                  : null,
              transition:
                transitionRunning || selectedMember ? null : 'all 0.1s',
            }"
          >
            {{ member.abbreviation || member.nickname || member.name }}
          </text>
        </svg>

        <b-form-checkbox v-model="snapping" switch class="mt-3">
          Snapping
        </b-form-checkbox>
      </b-col>
    </b-row>

    <br />

    <b-button v-b-toggle.collapse-1 variant="outline-primary" class="mt-4">
      Team
    </b-button>
    <b-collapse id="collapse-1" class="mt-2">
      <b-table
        class="w-75 mx-auto"
        striped
        hover
        :items="members"
        :fields="table_fields"
        sort-by="name"
      >
        <template #cell(color)="data">
          <b-form-input
            v-model="data.value"
            type="color"
            @input="(event) => setColor(event, data.item.id)"
          ></b-form-input>
        </template>
      </b-table>
    </b-collapse>
  </div>
</template>

<script>
import TeamService from "@/services/TeamService";
import ChoreoService from "@/services/ChoreoService";
import ColorService from "@/services/ColorService";

import { BIconMap } from "bootstrap-vue";

const dotRadius = 20;

export default {
  name: "MatEditor",
  components: { BIconMap },
  data: () => ({
    count: 0,
    choreo: null,
    dotRadius,
    selectedMember: null,
    transitionRunning: false,
    snapping: true,
    snappingDistance: dotRadius / 2,
    members: [],
    table_fields: [
      { key: "name", sortable: true, class: "text-left" },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "color", label: "Farbe" },
    ],
  }),
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
      // this.$refs[`member-${this.selectedMember.id}`][0].removeEventListener(
      this.$refs[`svgCanvas`].removeEventListener("mousemove", this.mouseMove);
      this.selectedMember = null;
    },
    mouseMove(event) {
      if (!this.selectedMember) return;

      const { x: canvasX, y: canvasY } =
        this.$refs.svgCanvas.getBoundingClientRect();

      let membersCopy = this.members;
      const m = membersCopy.find((m) => m.id == this.selectedMember.id);

      let xNew = event.clientX - canvasX;
      let yNew = event.clientY - canvasY;

      if (xNew == m.x && yNew == m.y) return;

      m.x = xNew;
      m.y = yNew;
      this.members = membersCopy;

      if (this.snapping) {
        const otherMembers = this.members.filter(
          (m) => m.id != this.selectedMember.id
        );
        const closestX = otherMembers.sort(
          (a, b) => Math.abs(a.x - xNew) - Math.abs(b.x - xNew)
        )[0].x;
        if (Math.abs(closestX - xNew) < this.snappingDistance) xNew = closestX;

        const closestY = otherMembers.sort(
          (a, b) => Math.abs(a.y - yNew) - Math.abs(b.y - yNew)
        )[0].y;
        if (Math.abs(closestY - yNew) < this.snappingDistance) yNew = closestY;
      }

      m.x = xNew;
      m.y = yNew;
      this.members = membersCopy;

      const choreoCopy = this.choreo;

      if (!choreoCopy.actions) choreoCopy.actions = [];

      if (!choreoCopy.actions.find((a) => a.count == this.count))
        choreoCopy.actions.push({ count: this.count, items: [] });

      if (
        !choreoCopy.actions
          .find((a) => a.count == this.count)
          .items.find((i) => i.type == "position")
      )
        choreoCopy.actions
          .find((a) => a.count == this.count)
          .items.push({
            type: "position",
            items: [],
          });

      if (
        !choreoCopy.actions
          .find((a) => a.count == this.count)
          .items.find((i) => i.type == "position")
          .items.find((i) => i.memberId == this.selectedMember.id)
      )
        choreoCopy.actions
          .find((a) => a.count == this.count)
          .items.find((i) => i.type == "position")
          .items.push({ memberId: this.selectedMember.id, x: xNew, y: yNew });

      choreoCopy.actions
        .find((a) => a.count == this.count)
        .items.find((i) => i.type == "position")
        .items.find((i) => i.memberId == this.selectedMember.id).x = xNew;
      choreoCopy.actions
        .find((a) => a.count == this.count)
        .items.find((i) => i.type == "position")
        .items.find((i) => i.memberId == this.selectedMember.id).y = yNew;

      this.choreo = choreoCopy;
    },
    findAbbreviation(m) {
      if (m.abbreviation) return m.abbreviation;

      let result;
      let potentialAbbreviation;
      let abbreviationFound = false;
      let substringLength = 1;
      while (!abbreviationFound) {
        if (m.nickname) {
          potentialAbbreviation = m.nickname.substring(0, substringLength);
        } else {
          potentialAbbreviation = m.name
            .split(" ")
            .map((s) => s.substring(0, substringLength))
            .join("");
        }

        if (
          !this.members.find((m) => m.abbreviation == potentialAbbreviation)
        ) {
          result = potentialAbbreviation;
          abbreviationFound = true;
        } else {
          substringLength += 1;
        }
        // abbreviationFound = true;
      }

      return result;
    },
    loadTeam() {
      return TeamService.getByName("TestTeam").then((team) => {
        this.members = team.members.map((m, i) => {
          let yNew = Math.floor(i / 8 + 1) * dotRadius + 20;
          let xNew = (dotRadius * 3 * i + 50) % 500;

          return {
            ...m,
            x: xNew,
            y: yNew,
            color: ColorService.getRandom(),
            // id: (Math.random() + 1).toString(36).substring(7),
          };
        });

        this.members = this.members.map((m) => {
          if (!m.abbreviation) m.abbreviation = this.findAbbreviation(m);
          return m;
        });

        return team;
      });
    },
    setColor(event, id) {
      const membersCopy = this.members;
      membersCopy.find((m) => m.id == id).color = event;
      this.members = membersCopy;
    },
    setCount(achter, count) {
      this.count = achter * 8 + count;
    },
  },
  mounted() {
    this.loadTeam().then(() => {
      ChoreoService.getById("asdf").then((choreo) => {
        this.choreo = choreo;
      });
    });
  },
  computed: {
    achter() {
      if (!this.choreo) return [];
      else {
        const achterLength = Math.ceil(this.choreo.counts / 8);
        const achter = new Array(achterLength).fill(null).map((_, i) => ({
          achter: i,
          1: this.choreo.actions.find((a) => a.count == i * 8 + 0)?.items,
          2: this.choreo.actions.find((a) => a.count == i * 8 + 1)?.items,
          3: this.choreo.actions.find((a) => a.count == i * 8 + 2)?.items,
          4: this.choreo.actions.find((a) => a.count == i * 8 + 3)?.items,
          5: this.choreo.actions.find((a) => a.count == i * 8 + 4)?.items,
          6: this.choreo.actions.find((a) => a.count == i * 8 + 5)?.items,
          7: this.choreo.actions.find((a) => a.count == i * 8 + 6)?.items,
          8: this.choreo.actions.find((a) => a.count == i * 8 + 7)?.items,
        }));
        return achter;
      }
    },
    currentPositions() {
      let members = this.members;
      if (!this.choreo) return members;
      this.choreo.actions
        .filter((a) => a.count <= this.count)
        .sort((a, b) => a.count - b.count)
        .forEach((a) => {
          a.items.forEach((i) => {
            switch (i.type) {
              case "position":
                i.items.forEach((item) => {
                  const member = members.find((m) => m.id == item.memberId);
                  try {
                    if (item.x) member.x = item.x;
                    if (item.y) member.y = item.y;
                  } catch (e) {
                    console.warn(member, item);
                  }
                });
                break;
              default:
                break;
            }
          });
        });
      return members;
    },
  },
};
</script>

<style lang="scss"></style>
