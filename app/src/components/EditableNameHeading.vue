<template>
  <h1>
    <b-row align-h="start" align-v="center" no-gutters>
      <b-col cols="auto" class="mr-2" v-if="name">
        <em>{{ name }}</em>
      </b-col>
      <b-col>
        <b v-if="!edit" class="mt-2">
          {{ value || placeholder || $t("neu") }}
        </b>
        <b-button
          v-if="!edit"
          variant="light"
          class="ml-2"
          @click="() => startEditing()"
        >
          <b-icon-pen />
        </b-button>

        <b-input-group
          v-else
          @keydown.esc="cancelEditing"
          @keydown.enter="approveEdit"
        >
          <b-form-input
            v-model="valueReplica"
            autofocus
            :style="{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#2c3e50',
              border: 'none',
              fontSize: '40px',
              height: '1em',
              textDecoration: 'underline dotted',
            }"
            class="p-0"
          />
          <template #append>
            <b-button-group>
              <b-button variant="success" @click="() => approveEdit()">
                <b-icon-check />
              </b-button>
              <b-button variant="danger" @click="() => cancelEditing()">
                <b-icon-x />
              </b-button>
            </b-button-group>
          </template>
        </b-input-group>
      </b-col>
    </b-row>
  </h1>
</template>

<script>
/**
 * @module Component:EditableNameHeading
 *
 * @vue-prop {String} name - The label or name to display as the heading.
 * @vue-prop {String} [value] - The value bound to the heading (for v-model).
 * @vue-prop {String} [placeholder] - Placeholder text when value is empty.
 *
 * @vue-data {Boolean} edit=false - Whether the heading is in edit mode.
 * @vue-data {String|null} valueReplica=null - Temporary value used during editing.
 *
 * @vue-event {string} input - Emitted when the value is changed by the user.
 *
 * @example <EditableNameHeading name="Title" v-model="value" />
 * @example <EditableNameHeading name="Title" v-model="value" placeholder="Enter name" />
 */
export default {
  name: "EditableNameHeading",
  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    placeholder: {
      type: String,
    },
  },
  data: () => ({
    edit: false,
    valueReplica: null,
  }),
  watch: {
    value() {
      this.valueReplica = this.value;
    },
  },
  methods: {
    startEditing() {
      this.valueReplica = this.value;
      this.edit = true;
    },
    cancelEditing() {
      this.edit = false;
      this.valueReplica = this.value;
    },
    approveEdit() {
      this.$emit("input", this.valueReplica);
      this.edit = false;
    },
  },
};
</script>
