<template>
  <BTable
    :items="[
      {
        role: $t('accountView.role.coach'),
        read: true,
        edit: true,
        delete: true,
      },
      {
        role: $t('accountView.role.assistant'),
        read: true,
        edit: true,
        delete: false,
      },
      {
        role: $t('accountView.role.athlete'),
        read: true,
        edit: false,
        delete: false,
      },
    ]"
    :fields="[
      { key: 'role', label: $t('modals.invite-user.role') },
      {
        key: 'read',
        label: $t('accessOverviewTable.read'),
        class: 'text-center',
      },
      {
        key: 'edit',
        label: $t('accessOverviewTable.edit'),
        class: 'text-center',
      },
      { key: 'delete', label: $t('loeschen'), class: 'text-center' },
    ]"
  >
    <template #cell(read)="data">
      <IBiCheckCircleFill v-if="data.value" color="green" />
      <IBiX v-else color="red" />
    </template>
    <template #cell(edit)="data">
      <IBiCheckCircleFill v-if="data.value" color="green" />
      <IBiX v-else color="red" />
    </template>
    <template #cell(delete)="data">
      <IBiCheckCircleFill v-if="data.value" color="green" />
      <IBiX v-else color="red" />
    </template>
  </BTable>
</template>

<script>
export default {
  name: "AccessOverViewTable",
};
</script>
