<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent is-vertical">
      <article class="tile is-child">
        <h4 class="title">View current boards and election dates</h4>
        <div class="field">
          <label class="label">Search by name, body code or abbreviation</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" type="text" v-model="query" placeholder="Search by name, body code or abbreviation" @input="refetch()">
            </div>
            <div class="control" v-if="can.viewDeleted">
              <a class="button is-info" v-if="includeDeleted"  @click="toggleIncludeDeleted()">Only show active bodies</a>
              <a class="button is-info" v-if="!includeDeleted" @click="toggleIncludeDeleted()">Also show deleted bodies</a>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Filter on body type</label>
          <div class="control">
            <multiselect
              v-model="selectedTypes"
              :multiple="true"
              :searchable="false"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              :options="types"
              placeholder="Select body types"
              track-by="value"
              label="name"
              @input="refetch">
            </multiselect>
          </div>
        </div>

        <div class="field">
          <label class="label">Other filters</label>
          <input class="checkbox" type="checkbox" v-model="filters.noCurrentBoard" @change="refetch()" />
          Only display bodies without a current board
        </div>

        <b-table :data="bodies" :loading="isLoading" narrowed>
          <template slot-scope="props">
            <b-table-column field="code" label="Body code">
              {{ props.row.code }}
            </b-table-column>

            <b-table-column field="name" label="Body name">
              <router-link :to="{ name: 'oms.bodies.view', params: { id: props.row.id } }">{{ props.row.name}}</router-link>
            </b-table-column>

            <b-table-column field="type" label="Type">
              {{ props.row.type | capitalize }}
            </b-table-column>

            <b-table-column field="election" label="Election">
              <template v-if="props.row.boards">
                {{ props.row.boards[0].elected_date }}
              </template>
              <span v-else>-</span>
            </b-table-column>

            <b-table-column field="term_start" label="Term start">
              <template v-if="props.row.boards">
                {{ props.row.boards[0].start_date }}
              </template>
              <span v-else>-</span>
            </b-table-column>

            <b-table-column field="term_end" label="Term end">
              <template v-if="props.row.boards">
                {{ props.row.boards[0].end_date }}
              </template>
              <span v-else>-</span>
            </b-table-column>

            <b-table-column field="status" label="Status" v-if="includeDeleted">
              <span class="tag is-small is-info" v-if="props.row.status === 'active'">Active</span>
              <span class="tag is-small is-danger" v-if="props.row.status === 'deleted'">Deleted</span>
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
  name: 'Boardslist',
  data () {
    return {
      bodies: [],
      types: [
        { value: 'antenna', name: 'Antenna' },
        { value: 'contact antenna', name: 'Contact antenna' },
        { value: 'contact', name: 'Contact' },
        { value: 'interest group', name: 'Interest group' },
        { value: 'working group', name: 'Working group' },
        { value: 'commission', name: 'Commission' },
        { value: 'committee', name: 'Committee' },
        { value: 'project', name: 'Project' },
        { value: 'partner', name: 'Partner' },
        { value: 'other', name: 'Other' }
      ],
      isLoading: false,
      filters: {
        noCurrentBoard: false
      },
      selectedTypes: [
        { value: 'antenna', name: 'Antenna' },
        { value: 'contact antenna', name: 'Contact antenna' },
        { value: 'contact', name: 'Contact' }
      ],
      query: '',
      includeDeleted: false,
      can: {
        viewDeleted: true
      }
    }
  },
  computed: {
    queryObject () {
      const queryObj = { }

      if (this.query) queryObj.query = this.query

      if (this.includeDeleted) queryObj.all = 'true'

      return queryObj
    },
    ...mapGetters({
      services: 'services',
      loginUser: 'user'
    })
  },
  methods: {
    toggleIncludeDeleted () {
      this.includeDeleted = !this.includeDeleted
      this.refetch()
    },
    refetch () {
      this.bodies = []
      this.fetchData()
    },
    fetchData () {
      this.isLoading = true
      if (this.source) this.source.cancel()
      this.source = this.axios.CancelToken.source()

      this.axios.get(this.services['core'] + '/bodies', { params: this.queryObject, cancelToken: this.source.token }).then((bodiesResponse) => {
        this.bodies = bodiesResponse.data.data

        const types = this.selectedTypes.map((type) => type.value)
        this.bodies = this.bodies.filter(x => types.includes(x.type))

        this.axios.get(this.services['network'] + '/boards').then((boardsResponse) => {
          const boards = boardsResponse.data.data

          // TODO: sort boards based on some date-metric, such that the most recent (?) is first in list
          // Add boards to their corresponding body
          for (const board of boards) {
            const body = this.bodies.find(x => board.body_id === x.id)
            if (body) {
              if (!body.boards) {
                body.boards = [] // allows for multiple boards per body
              }
              body.boards.push(board)
            }
          }

          // Apply filters on the final data
          if (this.filters.noCurrentBoard) {
            const today = moment().format('YYYY-MM-DD')
            this.bodies = this.bodies.filter(x => !x.boards || moment(x.boards[0].end_date).isBefore(today, 'date'))
          }
          this.isLoading = false
        }).catch((err) => {
          this.$root.showError('Could not fetch boards list', err)
        })
      }).catch((err) => {
        this.$root.showError('Could not fetch bodies list', err)
      })
    }
  },
  mounted () {
    this.fetchData()
  }
}

</script>
