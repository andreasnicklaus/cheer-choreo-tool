<template>
  <h1>
    <BRow align-h="start" align-v="center" no-gutters>
      <BCol v-if="name" cols="auto" class="me-2">
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

        <BInputGroup v-else>
          <BFormInput
            v-model="valueReplica as string"
            type="text"
            autofocus
            :style="{
              fontWeight: 'bold',
              color: 'var(--bs-body-color)',
              border: 'none',
              fontSize: '40px',
              height: '1em',
              textDecoration: 'underline dotted',
            }"
            class="p-0"
            data-testid="editHeading-input"
            @keydown="
              (e: any) => {
                if (e.key === 'Escape') cancelEditing();
                if (e.key === 'Enter') approveEdit();
              }
            "
          />
          <template #append>
            <BButtonGroup>
              <BButton
                variant="success"
                data-testid="approve-edit-button"
                @click="() => approveEdit()"
              >
                <IBiCheck />
              </BButton>
              <BButton
                variant="danger"
                data-testid="cancel-edit-button"
                @click="() => cancelEditing()"
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

<script lang="ts">
import { defineComponent } from "vue";
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
export default defineComponent({
  name: "EditableNameHeading",
  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: ["input"],
  data: () => ({
    edit: false,
    valueReplica: undefined as String | undefined,
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
});
</script>
