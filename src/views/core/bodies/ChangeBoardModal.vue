
<template>
  <div class="modal-card" style="height: 75vh">
    <header class="modal-card-head">
      <p class="modal-card-title">Change board</p>
      <button class="delete" aria-label="close" @click="$parent.close()"></button>
    </header>
    <section class="modal-card-body">

      <div class="field">
        <label class="label required">Board election date</label>
        <div class="control">
          <flat-pickr
            placeholder="Select date"
            class="input"
            required
            v-model="board.elected_date" />
        </div>
      </div>

      <b-field grouped>
        <b-field expanded>
          <template slot="label">
            Term start date <span style="color: red;">*</span>
          </template>
          <div class="control">
            <flat-pickr
              placeholder="Select date"
              class="input"
              required
              v-model="board.start_date" />
          </div>
        </b-field>

        <b-field expanded label="Term end date">
          <div class="control">
            <flat-pickr
              placeholder="Select date"
              class="input"
              v-model="board.end_date" />
          </div>
        </b-field>
      </b-field>

      <hr>

      <b-field grouped v-for="(position, index) in board.positions" v-bind:key="index" style="height: 36px;">
        <b-field>
          <template v-if="position.required">
            <strong>{{ position.function }} <span style="color: red;">*</span></strong>
          </template>

          <template v-else>
            <b-input slot="label" placeholder="Function" v-model="position.function" />
          </template>
        </b-field>

        <b-autocomplete
          v-model="position.name"
          :data="members"
          :loading="isLoading"
          @input="query => fetchMembers(query)"
          @select="user => position.id = user.id"
          :expanded="true"
          field="name">
          <template slot-scope="props">
            <div class="media">
              <div class="media-content">{{ props.option.first_name }} {{ props.option.last_name }}</div>
            </div>
          </template>
        </b-autocomplete>

        <b-button v-if="!position.required" class="button is-danger" @click="deletePosition(index)">
          <span class="white"><font-awesome-icon :icon="['fa', 'trash-alt']" /></span>
        </b-button>
      </b-field>

      <b-field>
        <button class="button is-primary" @click="addPosition()">Add new position</button>
      </b-field>

      <hr>

      <div class="field">
        <label class="label">Message</label>
        <div class="control">
          <b-input type="textarea" v-model="board.message" />
        </div>
        <label class="label">Preview <MarkdownTooltip/></label>
        <div class="content">
          <span v-html="$options.filters.markdown(board.message)" />
        </div>
      </div>
    </section>

    <footer class="modal-card-foot">
      <button class="button is-primary" @click="saveChangeBoard()">Save changes</button>
      <button class="button" @click="$parent.close()">Cancel</button>
    </footer>

  </div>
</template>

<script>
import MarkdownTooltip from '../../../components/tooltips/MarkdownTooltip'

export default {
  components: {
    MarkdownTooltip
  },
  name: 'ChangeBoardModal',
  props: ['body', 'services', 'showError', 'showSuccess'],
  data () {
    return {
      board: {
        elected_date: '',
        start_date: '',
        end_date: null,
        positions: [
          { function: 'President', name: '', id: '', required: true },
          { function: 'Secretary', name: '', id: '', required: true },
          { function: 'Treasurer', name: '', id: '', required: true }
        ],
        message: ''
      },
      members: [],
      isLoading: false,
      isSaving: false
    }
  },
  methods: {
    saveChangeBoard () {
      this.isSaving = true

      const board_export = {
        body_id: this.body.id,
        elected_date: this.board.elected_date,
        start_date: this.board.start_date,
        end_date: this.board.end_date,
        president: this.board.positions[0].id,
        secretary: this.board.positions[1].id,
        treasurer: this.board.positions[2].id,
        // TODO: Think of a good way to export other positions
        // Probably just with function and id
        // other_members: {
        //
        // },
        message: this.board.message
        // TODO: Add image
        // image:
      }

      this.axios.post(
        this.services['network'] + '/bodies/' + this.body.id + '/boards',
        board_export
      ).then((response) => {
        this.isSaving = false
        this.showSuccess('Board is saved.')
        this.$parent.close()
      }).catch((err) => {
        this.isSaving = false
        this.showError('Something went wrong', err)
      })
    },
    addPosition () {
      this.board.positions.push({
        function: '',
        name: '',
        id: '',
        required: false
      })
    },
    deletePosition (index) {
      this.board.positions.splice(index, 1)
    },
    fetchMembers (query) {
      if (!query) return

      this.isLoading = true
      this.members = []

      if (this.token) this.token.cancel()
      this.token = this.axios.CancelToken.source()

      // Get all the members of this body, matching with what the user typed in
      this.axios.get(this.services['core'] + '/bodies/' + this.body.id + '/members', {
        cancelToken: this.token.token,
        params: { query: query }
      }).then((response) => {
        const users = response.data.data
        for (const user of users) {
          user.user.name = user.user.first_name + ' ' + user.user.last_name
          this.members.push(user.user)
        }
        this.isLoading = false
      }).catch((err) => {
        if (this.axios.isCancel(err)) {
          return
        }

        this.isLoadingMembers = false
        this.showError('Could not fetch members', err)
      })
    },
  }
}

</script>
