<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <article class="tile is-child">
        <h4 class="title">Antenna Criteria Check</h4>
        <h2 class="subtitle">{{ statutory.name }}</h2>
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

            <b-table-column field="communication" label="Communication (C)">
              <b-tag type="is-light" size="is-medium">Empty</b-tag>
            </b-table-column>

            <b-table-column field="boardElection" label="Board election (BE)">
              <b-tag type="is-success" size="is-medium" v-if="props.row.check_elections_last_year && !showDetails">Yes</b-tag>
              <b-tag type="is-success" size="is-medium" v-if="props.row.check_elections_last_year && showDetails">
                {{ props.row.board_term_elected }}
              </b-tag>
              <b-tag type="is-danger" size="is-medium" v-if="!props.row.check_elections_last_year && props.row.type === 'antenna'">No</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="!props.row.check_elections_last_year && props.row.type !== 'antenna'">Else</b-tag>
            </b-table-column>

            <b-table-column field="membersList" label="Members list (ML)">
              <b-tag type="is-success" size="is-medium" v-if="props.row.submitted_members_list">Yes</b-tag>
              <b-tag type="is-danger" size="is-medium" v-if="!props.row.submitted_members_list && props.row.type !== 'contact'">No</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="!props.row.submitted_members_list && props.row.type === 'contact'">Else</b-tag>
            </b-table-column>

            <b-table-column field="membershipFee" label="Membership fee (F)">
              <b-tag type="is-light" size="is-medium" v-if="props.row.type !== 'contact'">Empty</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="props.row.type === 'contact'">Else</b-tag>
            </b-table-column>

            <b-table-column field="mostRecentEvent" label="Events (E)">
              <b-tag type="is-success" size="is-medium" v-if="props.row.check_events && !showDetails">Yes</b-tag>
              <b-tag type="is-success" size="is-medium" v-if="props.row.check_events && showDetails">
                {{ props.row.latest_event }}
              </b-tag>
              <b-tag type="is-danger" size="is-medium" v-if="!props.row.check_events && props.row.type === 'antenna'">No</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="!props.row.check_events && props.row.type !== 'antenna'">Else</b-tag>
            </b-table-column>

            <b-table-column field="attendance" label="Agora attendance (AA)">
              <b-tag type="is-light" size="is-medium" v-if="props.row.type === 'antenna'">Empty</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="props.row.type !== 'antenna'">Else</b-tag>
            </b-table-column>

            <b-table-column field="development" label="Development plan (DP)">
              <b-tag type="is-light" size="is-medium" v-if="props.row.type === 'antenna'">Empty</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="props.row.type !== 'antenna'">Else</b-tag>
            </b-table-column>

            <b-table-column field="fulfillment" label="Fulfillment report (FR)">
              <b-tag type="is-light" size="is-medium" v-if="props.row.type === 'antenna'">Empty</b-tag>
              <b-tag type="is-info" size="is-medium" v-if="props.row.type !== 'antenna'">Else</b-tag>
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
      statutory: null,
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
    async fetchUpcomingAgora () {
      await this.axios.get(this.services['statutory'] + '/events/latest').then((response) => {
        this.statutory = response.data.data
      }).catch((err) => {
        this.isLoading = false
        this.$root.showError('Could not fetch next Agora data', err)
      })
    },
    fetchData () {
      this.isLoading = true

      this.axios.get(this.services['core'] + '/bodies').then(async (bodiesResponse) => {
        this.bodies = bodiesResponse.data.data
        this.bodies = this.bodies.filter(x => ['antenna', 'contact antenna', 'contact'].includes(x.type))

        const promises = []
        promises.push(this.checkBoardCriterium())
        promises.push(this.checkMembersList())
        promises.push(this.checkEventsCriterium())

        await Promise.all(promises)

        // TODO: Add all the antenna criteria here when they are automatically computed
        for (const body in this.bodies) {
          if (this.bodies[body].type === 'antenna') {
            this.bodies[body].status = (
              this.bodies[body].check_events && 
              this.bodies[body].check_elections_last_year && 
              this.bodies[body].submitted_members_list
            )
          }
          if (this.bodies[body].type === 'contact antenna') {
            this.bodies[body].status = this.bodies[body].submitted_members_list
          }
          if (this.bodies[body].type === 'contact') {
            this.bodies[body].status = true
          }
        }

        this.isLoading = false
      }).catch((err) => {
        this.isLoading = false
        this.$root.showError('Could not fetch bodies', err)
      })
    },
    async checkEventsCriterium () {
      // TODO: Also get the most recent statutory event and SU organised
      await this.axios.get(this.services['events'] + '/recents').then((eventsResponse) => {
        for (const event of eventsResponse.data.data) {
          for (const organizer in event.organizing_bodies) {
            const body = this.bodies.find(body => body.id === event.organizing_bodies[organizer].body_id)
            // TODO: What happens if there are multiple last events
            // Can happen if locals organised events with two locals together
            body.latest_event = event.latest_event
          }
        }

        for (const body in this.bodies) {
          // Check if the last event is in the past 2 years
          this.bodies[body].check_events = this.bodies[body].latest_event !== undefined && moment(this.bodies[body].latest_event).diff(moment(), 'years', true) <= 2
          this.bodies[body].latest_event = moment(this.bodies[body].latest_event).format('M[/]YYYY')
        }
      }).catch((err) => {
        this.isLoading = false
        this.$root.showError('Could not fetch event data', err)
      })
    },
    async checkBoardCriterium () {
      await this.axios.get(this.services['network'] + '/boards/current').then((boardsResponse) => {
        for (const board of boardsResponse.data.data) {
          const body = this.bodies.find(body => body.id === board.body_id)
          body.board_term_elected = board.elected_date
        }

        for (const body in this.bodies) {
          // Check if the current board was elected within the past year
          this.bodies[body].check_elections_last_year = this.bodies[body].board_term_elected !== undefined && moment(this.bodies[body].board_term_elected).diff(moment(), 'years', true) <= 1
          this.bodies[body].board_term_elected = moment(this.bodies[body].board_term_elected).format('D[/]M[/]YYYY')
        }
      }).catch((err) => {
        this.isLoading = false
        this.$root.showError('Could not fetch boards data', err)
      })
    },
    async checkMembersList () {
      await this.fetchUpcomingAgora()

      await this.axios.get(this.services['statutory'] + '/events/' + this.statutory.id + '/memberslists/missing').then((membersListResponse) => {
        for (const body in this.bodies) {
          this.bodies[body].submitted_members_list = this.bodies[body].id in membersListResponse.data.data.map(body => body.id)
        }
      }).catch((err) => {
        this.isLoading = false
        this.$root.showError('Could not fetch members list data', err)
      })
    }
  },
  mounted () {
    this.fetchData()
  }
}

</script>
