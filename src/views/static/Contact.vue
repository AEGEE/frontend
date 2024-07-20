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
    this.fetchData()
  },
  methods: {
    async fetchData() {
      // TODO: Ask CD what types of bodies they want to have in the address book
      try {
        const response = await this.axios.get(this.services['core'] + '/bodies')
        // TODO: Move filter to the backend by changing the request
        const bodies = response.data.data.filter(a => !['antenna', 'contact antenna', 'contact', 'partner', 'other'].includes(a.type))

        // Fetch members for each body
        const bodiesWithMembers = await Promise.all(bodies.map(async (body) => {
          const membersResponse = await this.axios.get(this.services['core'] + '/bodies/' + body.id + '/members')
          const members = membersResponse.data.data.map((member) => member.user.first_name + " " + member.user.last_name)
          body.members = members.join(', ')
          return body
        }))

        this.bodies = bodiesWithMembers
      } catch (err) {
        this.$root.showError('Could not fetch bodies or members', err)
      } finally {
        this.isLoading = false
      }
    }
  }
}

</script>
