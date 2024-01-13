<template>
	<div class="tile is-ancestor contact">
		<div class="tile is-parent is-vertical">
			<div class="tile is-child">
				<div class="title">Get in contact with a European Body</div>

				<b-table :data="bodies" :loading="isLoading" narrowed>
          <template slot-scope="props">

            <b-table-column field="name" label="Body name">
              <router-link :to="{ name: 'oms.bodies.view', params: { id: props.row.id } }">{{ props.row.name }}</router-link>
            </b-table-column>

            <b-table-column field="email" label="Email">
              {{ props.row.email }}
            </b-table-column>

						<b-table-column field="members" label="Members">
							{{ props.row.members }}
						</b-table-column>


          </template>

          <template slot="empty">
            <empty-table-stub />
          </template>
        </b-table>


			</div>
		</div>
	</div>
</template>
  

<script>
import { mapGetters } from 'vuex'
import constants from '../../constants.js'

export default {
  name: 'Contact',
  data () {
    return {
      constants,
      bodies: [],
      isLoading: false
    }
  },
	computed: mapGetters(['services']),
  mounted () {
    this.isLoading = true

    // TODO: Ask CD what types of bodies they want to have in the address book
    // this.axios.get(this.services['core'] + '/bodies', {
    //   params: { type: ['interest group', 'working group', 'commission', 'committee', 'project'] }
    // }).then((response) => {
    this.axios.get(this.services['core'] + '/bodies').then((response) => {
			// TODO: Move filter to the backend by changing the request
      this.bodies = response.data.data.filter(a => !['antenna', 'contact antenna', 'contact', 'partner', 'other'].includes(a.type))

			for (const body in this.bodies) {
				this.axios.get(this.services['core'] + '/bodies/' + this.bodies[body].id + '/members').then((response) => {
					const members = response.data.data.map((member) => {return member.user.first_name + " " + member.user.last_name})
					this.bodies[body].members = members.join(', ')
				}).catch((err) => {
					this.isLoading = false
					this.$root.showError('Could not fetch body members', err)
				})
			}

      this.isLoading = false
    }).catch((err) => {
      this.isLoading = false
      this.$root.showError('Could not fetch bodies', err)
    })

   
  }
}
</script>
