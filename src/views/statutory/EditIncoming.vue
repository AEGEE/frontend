<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <div class="tile is-child">
        <div class="title">Answer incoming questions to {{ event.name }}</div>

        <!-- TODO: fetch phone number from application answers and add to custom phone number question
                   fetch date of birth, meals, allergies from application and if changed also save them to application through special endpoint -->
        <!-- TODO: add frontend pages to the router, initially EditIncoming and ViewIncoming (for specific user) -->

        <!-- TODO: check if we can link this from the event view, if not we should do it from the application of the user
             TODO: check that /me works for the incoming form as well
             TODO: add a red banner in the application view if people have not submitted the incoming form yet, but keep the option open to update -->
        <form @submit.prevent="saveIncoming()">
          <div class="tile is-parent">
            <div class="tile is-child">
              <!-- <div class="field">
                <label class="label">Body <span class="has-text-danger">*</span></label>
                <div class="select" v-if="bodies.length > 0">
                  <select v-model="application.body_id">
                    <option v-for="body in bodies" v-bind:key="body.id" :value="body.id">{{ body.name }}</option>
                  </select>
                </div>
              </div>

              <event-no-body-notification v-if="bodies.length == 0" /> -->

              <div class="notification is-danger" v-if="errors.answers || errors.body_id || errors.gender || errors.date_of_birth">
                <div class="content">
                  Could not apply because of these reasons:
                  <ul>
                    <li v-for="(error, index) in errors.answers" v-bind:key="index">{{ error }}</li>
                  </ul>
                  <!-- <ul>
                    <li v-for="(error, index) in errors.body_id" v-bind:key="index">{{ error }}</li>
                  </ul>
                  <ul v-if="errors.gender">
                    <li>Please set the gender in <router-link target="_blank" rel="noopener noreferrer" :to="{ name: 'oms.members.view', params: { id: 'me' } }">your profile.</router-link></li>
                  </ul>
                  <ul v-if="errors.date_of_birth">
                    <li>Please set the date of birth in <router-link target="_blank" rel="noopener noreferrer" :to="{ name: 'oms.members.view', params: { id: 'me' } }">your profile.</router-link></li>
                  </ul> -->
                </div>
              </div>

              <!-- <div class="field">
                <label class="label">Nationality <span class="has-text-danger">*</span></label>
                <div class="control">
                  <div class="select">
                    <select v-model="application.nationality">
                      <option v-for="(nationality, index) in nationalities" v-bind:key="index">{{ nationality }}</option>
                    </select>
                  </div>
                </div>
                <p class="help is-danger" v-if="errors.nationality">{{ errors.nationality.join(', ') }}</p>
              </div> -->

              <div class="field">
                <label class="label">Meals type <span class="has-text-danger">*</span></label>
                <div class="control">
                  <div class="select">
                    <select v-model="incoming.meals">
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                      <option v-if="event.url !== 'spring-agora-enschede-2023'">Meat-eater</option>
                    </select>
                  </div>
                </div>
                <p class="help is-danger" v-if="errors.meals">{{ errors.meals.join(', ') }}</p>
              </div>

              <div class="field is-fullwidth">
                <label class="label">Allergies</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    v-model="incoming.allergies" />
                </div>
              </div>

              <!-- <div class="field is-fullwidth">
                <label class="label">Number of {{ eventTypesPlural[event.type] || 'EPM' }} visited <span class="has-text-danger">*</span></label>
                <div class="control">
                  <input
                    class="input"
                    type="number"
                    required
                    min="0"
                    v-model="application.number_of_events_visited" />
                </div>
              </div> -->

              <!-- <div class="field is-fullwidth">
                <label class="has-text-weight-bold checkbox">
                  Visa required?
                  <input
                    class="checkbox"
                    type="checkbox"
                    v-model="application.visa_required" />
                </label>
              </div> -->

              <div class="field is-fullwidth" v-for="(question, index) in event.questions" v-bind:key="index">
                <div class="control">
                  <label class="has-text-weight-bold">
                    {{ question.name }} <span class="has-text-danger" v-if="question.required">*</span>
                  </label>
                  <!-- TODO: show question.description as well -->
                </div>
                <div class="control" v-if="question.type === 'text'">
                  <textarea
                    class="textarea"
                    :required="question.required"
                    v-model="application.answers[index]" />
                </div>
                <div class="control" v-if="question.type === 'string'">
                  <input
                    class="input"
                    type="text"
                    :required="question.required"
                    v-model="application.answers[index]" />
                </div>
                <div class="control" v-if="question.type === 'number'">
                  <input
                    class="input"
                    type="number"
                    v-model.number="application.answers[index]" />
                </div>
                <div class="control" v-if="question.type === 'checkbox'">
                  <input
                    class="checkbox"
                    type="checkbox"
                    :required="question.required"
                    v-model="application.answers[index]" />
                </div>
                <div class="control" v-if="question.type === 'select'">
                  <div class="select">
                    <select v-model="application.answers[index]" required>
                      <option v-for="(value, index) in question.values" v-bind:key="index">{{ value }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="field">
                <button type="submit" class="button is-primary">
                  Save application!
                </button>
              </div>
            </div>
          </div>

          <b-loading is-full-page="false" :active.sync="isLoading" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EditApplication',
  // components: {
  //   EventNoBodyNotification
  // },
  data () {
    return {
      event: {
        name: null,
        questions: []
      },
      eventTypesPlural: {
        agora: 'Agorae',
        epm: 'EPMs',
        spm: 'SPMs'
      },
      bodies: [],
      application: {
        body: null,
        body_id: null,
        id: null,
        visa_required: false,
        answers: [],
        meals: '',
        allergies: '',
        number_of_events_visited: 0
      },
      // nationalities,
      can: {
        apply: false
      },
      errors: {},
      isLoading: false,
      isSaving: false
    }
  },
  methods: {
    saveIncoming () {
      if (!this.application.body_id) {
        return this.$root.showError('Please select a body.')
      }

      this.errors = {}

      const promise = this.isNew
        ? this.axios.post(this.services['statutory'] + '/events/' + this.$route.params.id + '/applications', this.application)
        : this.axios.put(this.services['statutory'] + '/events/' + this.$route.params.id + '/applications/' + this.$route.params.application_id, this.application)

      promise.then((application) => {
        this.$root.showSuccess('Application is saved.')

        return this.$router.push({
          name: 'oms.statutory.applications.view',
          params: { id: this.$route.params.id, application_id: application.data.data.id }
        })
      }).catch((err) => {
        this.isSaving = false

        if (err.response.status === 422) { // validation errors
          this.errors = err.response.data.errors
          return this.$root.showError('Some of the application data is invalid.')
        }

        this.$root.showError('Could not save application', err)
      })
    }
    // ,
    // saveBoard () {
    //   // Copy data from the form into an object to submit it in the format the backend needs it
    //   this.isSaving = true

    //   const toServer = {
    //     participant_type: this.application.participant_type,
    //     participant_order: this.application.participant_order,
    //     board_comment: this.application.board_comment
    //   }

    //   this.axios.put(this.services['statutory'] + '/events/' + this.$route.params.id + '/applications/' + this.$route.params.application_id + '/board', toServer).then(() => {
    //     this.$root.showSuccess('Application is saved.')
    //   }).catch((err) => {
    //     this.isSaving = false

    //     if (err.response.status === 422) { // validation errors
    //       this.errors = err.response.data.errors
    //       return this.$root.showError('Some of the application data is invalid.')
    //     }

    //     this.$root.showError('Could not save application', err)
    //   })
    // },
  },
  computed: {
    ...mapGetters({
      services: 'services',
      loginUser: 'user'
    }),
    isNew () {
      return !this.$route.params.incoming_id
    }
  },
  watch: {
    // 'application.visa_required': function (val) {
    //   if (!val) {
    //     this.application.visa_passport_number = ''
    //     this.application.visa_place_of_birth = ''
    //     this.application.visa_passport_number = ''
    //     this.application.visa_passport_issue_date = ''
    //     this.application.visa_passport_expiration_date = ''
    //     this.application.visa_passport_issue_authority = ''
    //     this.application.visa_embassy = ''
    //     this.application.visa_street_and_house = ''
    //     this.application.visa_postal_code = ''
    //     this.application.visa_city = ''
    //     this.application.visa_country = ''
    //   }
    // }
  },
  mounted () {
    this.isLoading = true
    this.axios.get(this.services['statutory'] + '/events/' + this.$route.params.id).then((response) => {
      this.event = response.data.data
      this.can = response.data.data.permissions

      // Prefilling default values for application answers
      this.application.answers = Array.from({ length: this.event.questions.length }, (value, index) => {
        switch (this.event.questions[index].type) {
        case 'number':
          return 0
        case 'checkbox':
          return false
        case 'select':
          return this.event.questions[index].values[0]
        default:
          return ''
        }
      })

      // If this is a new application, then allowing selecting bodies which the current user is a member of
      // and not fetching application.
      if (this.isNew) {
        this.bodies = this.loginUser.bodies.filter(body => this.can.apply_from_body[body.id])

        // Setting primary body as default application body, if possible, otherwise pick the first body in the list
        if (this.bodies.length > 0) {
          if (this.bodies.some(b => b.id === this.loginUser.primary_body_id)) {
            this.application.body_id = this.loginUser.primary_body_id
          } else {
            this.application.body_id = this.bodies[0].id
          }
        }

        this.isLoading = false
        return
      }

      // Fetching application
      this.axios.get(this.services['statutory'] + '/events/' + this.$route.params.id + '/applications/' + this.$route.params.application_id).then((application) => {
        this.application = application.data.data
        this.can = application.data.data.permissions

        // Fetching user to get his/her bodies
        return this.axios.get(this.services['core'] + '/members/' + this.application.user_id)
      }).then((user) => {
        this.bodies = user.data.data.bodies.filter(body => this.can.apply_from_body[body.id])
        this.isLoading = false
      }).catch((err) => {
        this.isLoading = false

        // If there's no application, just ignore, otherwise re-throw the error
        if (!err.response || err.response.status !== 404) {
          throw err
        }
      })
    }).catch((err) => {
      if (err.response.status === 404) {
        this.$root.showError('Application is not found')
      } else {
        this.$root.showError('Some error happened', err)
      }

      this.$router.push({
        name: 'oms.statutory.incoming.view',
        params: { id: this.$route.params.id, application_id: this.$route.params.application_id }
      })
    })
  }
}
</script>
