<template>
  <b-container class="edit">
    <EditableNameHeading
      name="Choreo"
      :value="choreo?.name"
      class="mb-4"
      @input="onNameEdit"
    />

    <b-row align-v="center">
      <b-col>
        <b-row align-h="between" align-v="center" class="mb-4 mx-auto w-50">
          <b-col cols="auto">
            <b-button
              variant="outline-secondary"
              @click="() => setCounter(count - 1)"
              :disabled="count <= 0"
            >
              <b-icon-arrow-left />
            </b-button>
          </b-col>
          <b-col cols="auto">
            <p class="mb-0">Achter: {{ Math.floor(count / 8) + 1 }}</p>
            <p class="mb-0">Count: {{ (count % 8) + 1 }}</p>
          </b-col>
          <b-col cols="auto">
            <b-button
              variant="outline-secondary"
              @click="() => setCounter(count + 1)"
              :disabled="choreo ? count >= choreo.counts - 1 : false"
            >
              <b-icon-arrow-right />
            </b-button>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="auto" class="h3">
        <b-icon-info-circle id="popover-info-target" variant="secondary" />
        <b-popover
          target="popover-info-target"
          triggers="hover"
          placement="left"
          :style="{ width: '400px' }"
        >
          <template #title>Steuerung</template>
          <b-table-simple>
            <b-tbody>
              <b-tr>
                <b-td class="font-weight-bold">Nächster Count</b-td>
                <b-td>
                  <b-icon-arrow-right class="mr-1" />
                  <b-badge variant="light"> Pfeil rechts </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Voriger Count</b-td>
                <b-td>
                  <b-icon-arrow-left class="mr-1" />
                  <b-badge variant="light"> Pfeil links </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Nächster Achter</b-td>
                <b-td>
                  <b-icon-arrow-down class="mr-1" />
                  <b-badge variant="light"> Pfeil unten </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Voriger Achter</b-td>
                <b-td>
                  <b-icon-arrow-up class="mr-1" />
                  <b-badge variant="light"> Pfeil oben </b-badge>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </b-popover>
      </b-col>
    </b-row>

    <b-row align-h="around">
      <b-col cols="auto">
        <Mat
          :currentPositions="currentPositions"
          :transitionRunning="transitionRunning"
          :transitionMs="transitionMs"
          @positionChange="onPositionChange"
        />
      </b-col>
      <b-col cols="12" md="6">
        <b-card>
          <b-card-header
            class="d-flex justify-content-between align-items-center"
          >
            <b-card-title class="mb-0"> Dieser Count </b-card-title>
            <b-badge>
              {{ countToString(count) }}
            </b-badge>
          </b-card-header>
          <b-list-group flush>
            <b-skeleton-wrapper :loading="!actionsForCurrentCount">
              <template #loading>
                <b-list-group-item v-for="(_, i) in Array(1)" :key="i">
                  <b-skeleton width="25%" height="30px" class="mb-2" />
                  <b-skeleton width="50%" />
                  <b-skeleton width="25%" class="mb-3" />
                </b-list-group-item>
              </template>
              <b-list-group-item
                v-for="(action, i) in actionsForCurrentCount"
                :key="i"
                :variant="action.type == 'hit' ? null : 'light'"
              >
                <div v-if="action.type == 'hit'">
                  <h5>
                    <b-row align-h="between" align-v="center">
                      <b-col>
                        {{ action.name }}
                      </b-col>
                      <b-col cols="auto">
                        <b-button-group>
                          <b-button
                            variant="outline-primary"
                            v-b-tooltip.hover
                            title="Zum vorigen Count verschieben"
                          >
                            <b-icon-arrow-left />
                          </b-button>
                          <b-button
                            variant="outline-primary"
                            v-b-tooltip.hover
                            title="Zum nächsten Count verschieben"
                          >
                            <b-icon-arrow-right />
                          </b-button>
                          <b-button variant="outline-success">
                            <b-icon-pen />
                          </b-button>
                          <b-button variant="outline-danger">
                            <b-icon-trash />
                          </b-button>
                        </b-button-group>
                      </b-col>
                    </b-row>
                  </h5>
                  <b-col v-if="action.memberIds">
                    <b-row v-for="memberId in action.memberIds" :key="memberId">
                      <div
                        class="mr-2"
                        :style="{
                          height: '24px',
                          width: '24px',
                          backgroundColor:
                            teamMembers?.find((m) => m.id == memberId)?.color +
                            '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' +
                            teamMembers?.find((m) => m.id == memberId)?.color,
                        }"
                      ></div>
                      {{ teamMembers?.find((m) => m.id == memberId)?.name }}
                    </b-row>
                  </b-col>
                  <p v-else>Alle</p>
                </div>
                <div v-else-if="action.type == 'position'">
                  <h5>Aufstellung</h5>
                  <p>
                    Counts:
                    <b-badge variant="light">
                      {{ countToString(action.startCount) }}</b-badge
                    >
                    -
                    <b-badge variant="light">
                      {{ countToString(action.endCount) }}
                    </b-badge>
                  </p>
                  <b-col v-if="action.items">
                    <b-row v-for="item in action.items" :key="item.memberId">
                      <div
                        class="mr-2"
                        :style="{
                          height: '24px',
                          width: '24px',
                          backgroundColor:
                            teamMembers?.find((m) => m.id == item.memberId)
                              ?.color + '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' +
                            teamMembers?.find((m) => m.id == item.memberId)
                              ?.color,
                        }"
                      ></div>
                      {{
                        teamMembers?.find((m) => m.id == item.memberId)?.name
                      }}
                    </b-row>
                  </b-col>
                </div>
              </b-list-group-item>
            </b-skeleton-wrapper>
            <b-list-group-item v-if="actionsForCurrentCount.length == 0">
              <p class="text-muted">
                Für diesen Count hast du noch nichts geplant
              </p>
            </b-list-group-item>
          </b-list-group>
          <b-button variant="outline-success" block class="mt-2">
            <b-icon-plus />
            Hinzufügen
          </b-button>
        </b-card>
      </b-col>
    </b-row>

    <b-tabs content-class="mt-3" class="mt-5" fill>
      <b-tab title="Countsheet" active>
        <CountSheet
          v-if="choreo"
          :count="count"
          :choreo="choreo"
          @setCounter="setCounter"
        />
      </b-tab>
      <b-tab title="Team">
        <b-table
          striped
          hover
          :items="teamMembers"
          :fields="team_table_fields"
          sort-by="name"
        >
          <template #cell(color)="data">
            <div
              :style="{
                height: '24px',
                width: '24px',
                backgroundColor: data.value + '55',
                borderRadius: '50%',
                border: 'solid 2px ' + data.value,
              }"
            ></div>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script>
import Mat from "@/components/Mat.vue";
import ChoreoService from "@/services/ChoreoService";
import ColorService from "@/services/ColorService";
import TeamService from "@/services/TeamService";
import CountSheet from "@/components/CountSheet.vue";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
export default {
  components: { Mat, CountSheet, EditableNameHeading },
  data: () => ({
    choreoId: null,
    matHeight: 500,
    matWidth: 500,
    count: 0,
    teamMembers: null,
    team_table_fields: [
      { key: "name", sortable: true, class: "text-left" },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "color", label: "Farbe" },
    ],
    choreo: null,
    lastKeyEvent: null,
    transitionRunning: false,
    transitionMs: 500,
  }),
  mounted() {
    ChoreoService.getById(this.choreoId).then((choreo) => {
      if (!choreo) return;

      this.choreo = choreo;

      TeamService.getById(choreo.teamId).then((team) => {
        if (!team) return;

        this.teamMembers = team.members.map((m) => {
          // let yNew = Math.floor(i / 7) * 50 + 50;
          // let xNew = (this.matWidth / 7) * (i % 7) + this.matWidth / 7 / 2;

          if (!m.abbreviation)
            m.abbreviation = m.name
              .split(" ")
              .map((s) => s.substring(0, 1) + ".")
              .join("");

          return {
            ...m,
            color: ColorService.getRandom(),
          };
        });
      });
    });

    document.addEventListener("keydown", this.onKeyPress);
  },
  unmounted() {
    console.log("Unmount");
    document.removeEventListener("keydown", this.onKeyPress);
  },
  watch: {
    "$route.params": {
      handler() {
        this.choreoId = this.$route.params.choreoId;
      },
      immediate: true,
    },
  },
  methods: {
    onPositionChange(id, x, y) {
      const memberToUpdate = this.currentPositions.find((c) => c.id == id);
      memberToUpdate.x = x;
      memberToUpdate.y = y;
      // TODO: save position
    },
    onKeyPress(event) {
      if (["ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();

      if (
        this.lastKeyEvent &&
        Date.now() - this.lastKeyEvent.time < 100 &&
        this.lastKeyEvent.key == event.key
      )
        return;

      this.lastKeyEvent = {
        time: Date.now(),
        key: event.key,
      };

      switch (event.key) {
        case "ArrowLeft":
          if (this.count > 0) this.setCounter(this.count - 1);
          break;
        case "ArrowRight":
          if (this.count < this.choreo.counts - 1)
            this.setCounter(this.count + 1);
          break;
        case "ArrowDown":
          if (this.count < this.choreo.counts - 8)
            this.setCounter(this.count + 8);
          break;
        case "ArrowUp":
          if (this.count > 7) this.setCounter(this.count - 8);
          break;
      }
    },
    setCounter(count) {
      this.count = count;
      this.transitionRunning = true;
      setTimeout(() => (this.transitionRunning = false), this.transitionMs);
    },
    countToString(count) {
      return `${Math.floor(count / 8) + 1} / ${(count % 8) + 1}`;
    },
    onNameEdit(nameNew) {
      console.log(nameNew);
      // TODO: save new name
    },
  },
  computed: {
    currentPositions() {
      if (!this.teamMembers || !this.choreo) return [];
      else {
        let positions = [...this.teamMembers].map((m, i) => {
          let yNew = Math.floor(i / 7) * 50 + 50;
          let xNew = (this.matWidth / 7) * (i % 7) + this.matWidth / 7 / 2;

          return {
            ...m,
            x: xNew,
            y: yNew,
          };
        });

        positions.forEach((p) => {
          const positionActions = this.choreo.actions.filter(
            (a) =>
              a.type == "position" &&
              a.items.some((i) => i.memberId == p.id) &&
              a.startCount <= this.count &&
              a.endCount >= this.count
          );

          if (positionActions.length > 1)
            throw Error(
              "Es gibt überschneidende Actions in der Choreo mit type = 'position'"
            );
          else if (positionActions.length == 1) {
            const currentPosition = positionActions[0].items.find(
              (i) => i.memberId == p.id
            );
            p.x = currentPosition.x;
            p.y = currentPosition.y;
          } else {
            let previousPosition = { x: p.x, y: p.y, count: this.count };
            const previousPositionActions = this.choreo.actions
              .filter(
                (a) =>
                  a.type == "position" &&
                  a.items.some((i) => i.memberId == p.id) &&
                  a.endCount < this.count
              )
              .sort((a, b) => b.endCount - a.endCount);
            if (previousPositionActions.length > 0) {
              previousPosition = previousPositionActions[0].items.find(
                (i) => i.memberId == p.id
              );
              previousPosition.count = previousPositionActions[0].endCount;
            }

            let followingPosition = { ...previousPosition };
            followingPosition.count = this.choreo.counts;
            const followingPositionActions = this.choreo.actions
              .filter(
                (a) =>
                  a.type == "position" &&
                  a.items.some((i) => i.memberId == p.id) &&
                  a.startCount > this.count
              )
              .sort((a, b) => a.endCount - b.endCount);
            if (followingPositionActions.length > 0) {
              followingPosition = followingPositionActions[0].items.find(
                (i) => i.memberId == p.id
              );
              followingPosition.count = followingPositionActions[0].startCount;
            }

            const countsSincePrevious = this.count - previousPosition.count;
            const countsBetweenPreviousAndFollowing =
              followingPosition.count - previousPosition.count;

            const advancement =
              countsSincePrevious / countsBetweenPreviousAndFollowing;

            // console.table([
            //   {
            //     previousPosition: previousPosition.x,
            //     followingPosition: followingPosition.x,
            //     advancement,
            //     count: this.count,
            //     previousCount: previousPosition.count,
            //     countsSincePrevious,
            //     countsBetweenPreviousAndFollowing,
            //   },
            // ]);

            p.x =
              previousPosition.x +
              (followingPosition.x - previousPosition.x) * advancement;
            p.y =
              previousPosition.y +
              (followingPosition.y - previousPosition.y) * advancement;
          }
        });

        return positions;
      }
    },
    actionsForCurrentCount() {
      if (!this.choreo) return [];

      return this.choreo.actions.filter((a) => {
        switch (a.type) {
          case "hit":
            return a.count == this.count;
          case "position":
            return a.startCount <= this.count && a.endCount >= this.count;
          default:
            return false;
        }
      });
    },
  },
};
</script>
