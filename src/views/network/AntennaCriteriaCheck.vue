<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <article class="tile is-child">
        <h4 class="title">Antenna Criteria Check</h4>
        <b-table :data="bodies" :loading="isLoading" narrowed>
          <template slot-scope="props">
            <b-table-column field="name" label="Body name">
              <router-link :to="{ name: 'oms.bodies.view', params: { id: props.row.id } }">{{ props.row.name }}</router-link>
            </b-table-column>

            <b-table-column field="type" label="Type">
              {{ props.row.type }}
            </b-table-column>

            <b-table-column field="mostRecentEvent" label="Events (E)">
              <b-taglist attached v-if="props.row.latest_event_done">
                <b-tag type="is-success" size="is-medium">Yes</b-tag>
                <b-tag type="is-dark" size="is-medium">{{ props.row.next_needed_event }}</b-tag>
              </b-taglist>
              <b-tag type="is-danger" size="is-medium" v-else>No</b-tag>
            </b-table-column>

          </template>

          <template slot="empty">
            <empty-table-stub />
          </template>
        </b-table>
      </article>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'AntennaCriteriaCheck',
  data () {
    return {
      bodies: [],
      latest_events: [],
      isLoading: false
    }
  },
  computed: {
    ...mapGetters({
      services: 'services',
      loginUser: 'user'
    })
  },
  methods: {
    fetchData () {
      this.isLoading = true

      this.axios.get(this.services['core'] + '/bodies').then((response) => {
        this.bodies = response.data.data
        this.bodies = this.bodies.filter(x => ["antenna", "contact antenna", "contact"].includes(x.type))

        // Check if the last event is in the past 2 years
        this.axios.get(this.services['events'] + '/recents').then((response) => {
          this.latest_events = response.data.data
          for (const event in this.latest_events) {
            for (const organizer in this.latest_events[event].organizing_bodies) {
              const body = this.bodies.find(x => x.id === this.latest_events[event].organizing_bodies[organizer].body_id)
              // TODO: What happens if there are multiple last events
              // Can happen if locals organised events with two locals together
              body.latest_event = this.latest_events[event].LatestEvent
            }
          }

          for (const body in this.bodies) {
            this.bodies[body].latest_event_done = this.bodies[body].latest_event !== undefined && moment(this.bodies[body].latest_event).diff(moment(), 'years', true) <= 2
            this.bodies[body].next_needed_event = moment(this.bodies[body].latest_event).add(2, 'years').format("M[/]YYYY")
          }

          this.isLoading = false
        }).catch((err) => {
          this.isLoading = false
          this.$root.showError('Could not fetch event data', err)
        })
      }).catch((err) => {
          this.isLoading = false
          this.$root.showError('Could not fetch bodies', err)
      })   
    }
  },
  mounted () {
    this.fetchData()
  }
}

</script>