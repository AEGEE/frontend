<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <article class="tile is-child">
        <h4 class="title">Antenna Criteria Check</h4>
        <div class="buttons">
          <a class="button is-info" v-if="showDetails" @click="toggleShowDetails()">Show basic information</a>
          <a class="button is-info" v-if="!showDetails" @click="toggleShowDetails()">Show detailed information</a>

          <a class="button is-info" v-if="hideSafeLocals" @click="toggleHideSafeLocals()">Show all Locals</a>
          <a class="button is-info" v-if="!hideSafeLocals" @click="toggleHideSafeLocals()">Show only Locals in danger</a>
        </div>
        <b-table :data="filteredBodies" :loading="isLoading" narrowed>
          <template slot-scope="props">
            <b-table-column field="name" label="Body name">
              <router-link :to="{ name: 'oms.bodies.view', params: { id: props.row.id } }">{{ props.row.name }}</router-link>
            </b-table-column>

            <b-table-column field="type" label="Type">
              {{ props.row.type | capitalize }}
            </b-table-column>

            <b-table-column field="status" label="Status">
              <b-tag type="is-success" size="is-medium" v-if="props.row.status">Safe</b-tag>
              <b-tag type="is-warning" size="is-medium" v-else>Danger</b-tag>
            </b-table-column>

            <b-table-column field="" label="Communication (C)">
              
            </b-table-column>

            <b-table-column field="" label="Board election (BE)">
              
            </b-table-column>

            <b-table-column field="" label="Members list (ML)">
              
            </b-table-column>

            <b-table-column field="" label="Membership fee (F)">
              
            </b-table-column>

            <b-table-column field="mostRecentEvent" label="Events (E)">
              <b-tag type="is-success" size="is-medium" v-if="props.row.latest_event_done && !showDetails">Yes</b-tag>
              <b-tag type="is-success" size="is-medium" v-if="props.row.latest_event_done && showDetails">
                {{ props.row.next_needed_event }}
              </b-tag>
              <b-tag type="is-danger" size="is-medium" v-if="!props.row.latest_event_done">No</b-tag>
            </b-table-column>

            <b-table-column field="" label="Agora attendance (AA)">
              
            </b-table-column>

            <b-table-column field="" label="Development plan (DP)">
              
            </b-table-column>

            <b-table-column field="" label="Fulfillment report (FR)">
              
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
      showDetails: false,
      hideSafeLocals: false,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters({
      services: 'services',
      loginUser: 'user'
    }),
    filteredBodies () {
      if (!this.hideSafeLocals) return this.bodies
      return this.bodies.filter(body => { return body.status === false })
    }
  },
  methods: {
    toggleShowDetails () {
      this.showDetails = !this.showDetails
    },
    toggleHideSafeLocals () {
      this.hideSafeLocals = !this.hideSafeLocals
    },
    fetchData () {
      this.isLoading = true

      this.axios.get(this.services['core'] + '/bodies').then((response) => {
        this.bodies = response.data.data
        this.bodies = this.bodies.filter(x => ["antenna", "contact antenna", "contact"].includes(x.type))

        // Check if the last event is in the past 2 years
        // TODO: Also get the most recent statutory event and SU organised
        this.axios.get(this.services['events'] + '/recents').then((response) => {
          this.latest_events = response.data.data
          for (const event in this.latest_events) {
            for (const organizer in this.latest_events[event].organizing_bodies) {
              const body = this.bodies.find(x => x.id === this.latest_events[event].organizing_bodies[organizer].body_id)
              // TODO: What happens if there are multiple last events
              // Can happen if locals organised events with two locals together
              body.latest_event = this.latest_events[event].latest_event
            }
          }

          for (const body in this.bodies) {
            this.bodies[body].latest_event_done = this.bodies[body].latest_event !== undefined && moment(this.bodies[body].latest_event).diff(moment(), 'years', true) <= 2
            this.bodies[body].next_needed_event = moment(this.bodies[body].latest_event).add(2, 'years').format("M[/]YYYY")
          }


          for (const body in this.bodies) {
            // TODO: Add all the antenna criteria here when they are automatically computed
            this.bodies[body].status = this.bodies[body].latest_event_done
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