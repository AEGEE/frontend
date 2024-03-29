<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Add member</p>
      <button class="delete" aria-label="close" @click="$parent.close()" />
    </header>
    <section class="modal-card-body" style="height:200px;">
      <div class="field has-addons">
        <b-autocomplete
          v-model="addedMemberName"
          :data="members"
          field="title"
          :loading="isLoadingMembers"
          @input="fetchMembers"
          expanded="true"
          @select="option => addMember(option)">

          <template slot-scope="props">
            <div class="media">
              <div class="media-content">{{ props.option.first_name }} {{ props.option.last_name }}</div>
            </div>
          </template>
        </b-autocomplete>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button class="button" @click="$parent.close()">Cancel</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AddMemberModal',
  props: ['circle', 'services', 'showError', 'showSuccess'],
  data () {
    return {
      isLoadingMembers: false,
      memberName: '',
      members: [],
      token: null
    }
  },
  methods: {
    fetchMembers () {
      this.isLoadingMembers = true
      this.members = []

      if (this.token) this.token.cancel()
      this.token = this.axios.CancelToken.source()

      // If circle is bound to a body, search for body members. If not, use global search.
      const url = this.circle.body_id
        ? this.services['core'] + '/bodies/' + this.circle.body_id + '/members'
        : this.services['core'] + '/members'

      this.axios.get(url, {
        cancelToken: this.token.token,
        params: { query: this.addedMemberName }
      }).then((response) => {
        // Transform members if the circle is bound (there's another API response format)
        this.members = this.circle.body_id
          ? response.data.data.map(entry => entry.user)
          : response.data.data

        this.isLoadingMembers = false
      }).catch((err) => {
        if (this.axios.isCancel(err)) {
          return
        }

        this.isLoadingMembers = false
        this.showError('Could not fetch members', err)
      })
    },
    addMember (member) {
      this.axios.post(this.services['core'] + '/circles/' + this.circle.id + '/members', {
        user_id: member.id
      }).then(() => {
        this.showSuccess('Member is added.')
        this.$parent.close()
      }).catch((err) => {
        if (err.response.status === 422) {
          this.showError('Could not add member: this person is already a member of this circle.')
        } else {
          this.showError('Could not add member', err)
        }
      })
    }
  }
}
</script>
