<template>
  <h1>
    <BRow align-h="start" align-v="center" no-gutters>
      <BCol cols="auto" class="me-2" v-if="name">
        <em>{{ name }}</em>
      </BCol>
      <BCol>
        <b v-if="!edit" class="mt-2">
          {{ value || placeholder || $t("neu") }}
        </b>
        <BButton
          v-if="!edit"
          variant="light"
          class="ms-2"
          @click="() => startEditing()"
        >
          <IBiPen data-testid="edit-button" />
        </BButton>

        <BInputGroup
          v-else
          @keydown.esc="cancelEditing"
          @keydown.enter="approveEdit"
        >
          <BFormInput
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
            data-testid="editHeading-input"
          />
          <template #append>
            <BButtonGroup>
              <BButton
                variant="success"
                @click="() => approveEdit()"
                data-testid="approve-edit-button"
              >
                <IBiCheck />
              </BButton>
              <BButton
                variant="danger"
                @click="() => cancelEditing()"
                data-testid="cancel-edit-button"
              >
                <IBiX />
              </BButton>
            </BButtonGroup>
          </template>
        </BInputGroup>
      </BCol>
    </BRow>
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
  emits: ["input"],
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
