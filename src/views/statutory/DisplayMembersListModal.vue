<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Display members list</p>
      <button class="delete" aria-label="close" @click="$parent.close()" />
    </header>
    <section class="modal-card-body">
      <b-table :data="memberslist.members">
        <template slot-scope="props">
          <b-table-column field="user_id" label="User ID" numeric sortable>
            {{ props.row.user_id }}
          </b-table-column>

          <b-table-column field="first_name" label="First name" sortable>
            {{ props.row.first_name }}
          </b-table-column>

          <b-table-column field="last_name" label="Last name" sortable>
            {{ props.row.last_name }}
          </b-table-column>

          <b-table-column field="fee" label="Fee" numeric sortable>
            {{ props.row.fee.toFixed(2) }} {{ memberslist.currency }}
          </b-table-column>

          <b-table-column field="fee_to_aegee" label="Fee to AEGEE-Europe" numeric sortable>
            {{ props.row.fee_to_aegee.toFixed(2) }} EUR
          </b-table-column>
        </template>

        <template slot="empty">
          <empty-table-stub />
        </template>
      </b-table>
    </section>
    <footer class="modal-card-foot" />
  </div>
</template>

<script>
export default {
  name: 'DisplayMembersListModal',
  props: ['memberslist'],
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>
