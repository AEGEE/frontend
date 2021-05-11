<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <div class="tile is-child">
        <div class="title" v-show="isNew">Apply to {{ event.name }}</div>
        <div class="title" v-show="!isNew && this.can.apply">Edit your application on {{ event.name }}</div>
        <div class="title" v-show="!isNew && !this.can.apply">See your application on {{ event.name }}</div>

        <div class="subtitle" v-show="isNew && !this.can.apply">You cannot apply to this event.</div>

        <!-- TODO: add all fields -->
        <form @submit.prevent="saveApplication()">
          <div class="tile is-parent" v-show="this.can.apply">
            <div class="tile is-child">
              <div class="field">
                <label class="label">Body <span class="has-text-danger">*</span></label>
                <div class="select" v-show="bodies.length > 0">
                  <select v-model="application.body_id">
                    <option v-for="body in bodies" v-bind:key="body.id" :value="body.id">{{ body.name }}</option>
                  </select>
                </div>
              </div>

              <event-no-body-notification v-show="bodies.length == 0" />

              <div class="notification is-danger" v-if="errors.answers || errors.body_id || errors.gender || errors.date_of_birth">
                <div class="content">
                Could not apply because of these reasons:
                  <ul>
                    <li v-for="(error, index) in errors.answers" v-bind:key="index">{{ error }}</li>
                  </ul>
                  <ul>
                    <li v-for="(error, index) in errors.body_id" v-bind:key="index">{{ error }}</li>
                  </ul>
                  <ul v-if="errors.gender">
                    <li>Please set the gender in <router-link :to="{ name: 'oms.members.view', params: { id: 'me' } }" target='_blank'>your profile.</router-link></li>
                  </ul>
                  <ul v-if="errors.date_of_birth">
                    <li>Please set the date of birth in <router-link :to="{ name: 'oms.members.view', params: { id: 'me' } }" target='_blank'>your profile.</router-link></li>
                  </ul>
                </div>
              </div>

              <div class="field">
                <label class="label">Nationality <span class="has-text-danger">*</span></label>
                <div class="control">
                  <div class="select">
                    <select v-model="application.nationality">
                      <option v-for="(nationality, index) in nationalities" v-bind:key="index">{{ nationality }}</option>
                    </select>
                  </div>
                </div>
                <p class="help is-danger" v-if="errors.nationality">{{ errors.nationality.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="label">Travelling from <span class="has-text-danger">*</span></label>
                <div class="control">
                  <div class="select">
                    <select v-model="application.travelling_from">
                      <option v-for="(travelling_from, index) in countries" v-bind:key="index">{{ travelling_from }}</option>
                    </select>
                  </div>
                </div>
                <p class="help is-danger" v-if="errors.travelling_from">{{ errors.travelling_from.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="label">Meals type <span class="has-text-danger">*</span></label>
                <div class="control">
                  <div class="select">
                    <select v-model="application.meals">
                      <option>Meat-eater</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
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
                    v-model="application.allergies" />
                </div>
              </div>

              <div class="field is-fullwidth">
                <label class="has-text-weight-bold checkbox">
                  Visa required?
                  <input
                    class="checkbox"
                    type="checkbox"
                    v-model="application.visa_required" />
                </label>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Passport number <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_passport_number" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Passport issue date <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_passport_issue_date" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Passport expiration date <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_passport_expiration_date" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Passport issue authority <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_passport_issue_authority" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Place of birth <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_place_of_birth" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Embassy <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_embassy" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Street and house number <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_street_and_house" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Postal code <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_postal_code" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  City <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_city" />
                </div>
              </div>

              <div class="field is-fullwidth" v-if="application.visa_required">
                <label class="has-text-weight-bold">
                  Country <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    required
                    v-model="application.visa_country" />
                </div>
              </div>

              <div class="field">
                <label class="label">AEGEE experience <span class="has-text-danger">*</span></label>
                <div class="control">
                  <textarea class="textarea" required v-model="application.aegee_experience"></textarea>
                </div>
                <p class="help is-danger" v-if="errors.aegee_experience">{{ errors.aegee_experience.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="label">Ideal SU <span class="has-text-danger">*</span></label>
                <div class="control">
                  <textarea class="textarea" required v-model="application.ideal_su"></textarea>
                </div>
                <p class="help is-danger" v-if="errors.ideal_su">{{ errors.ideal_su.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="label">Motivation <span class="has-text-danger">*</span></label>
                <div class="control">
                  <textarea class="textarea" required v-model="application.motivation"></textarea>
                </div>
                <p class="help is-danger" v-if="errors.motivation">{{ errors.motivation.join(', ') }}</p>
              </div>

              <div class="field is-fullwidth" v-for="(question, index) in event.questions" v-bind:key="index">
                <div class="control">
                  <label class="has-text-weight-bold">
                    {{ question.description }} <span class="has-text-danger">*</span>
                  </label>
                </div>
                <div class="control">
                  <textarea
                    class="textarea"
                    required
                    v-model="application.answers[index]" />
                </div>
              </div>

              <div class="field">
                <label class="has-text-weight-bold">
                    Privacy Policy <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <b-checkbox required v-model="application.agreed_to_privacy_policy">
                    I agree with my personal data to be processed
                    by AEGEE-Europe for the purposes of the participant selection
                    and event organisation. AEGEE-Europe will disclose this data
                    to organising local for the time period of the event organisation.
                  </b-checkbox>
                </div>
                <p class="help is-danger" v-if="errors.agreed_to_privacy_policy">{{ errors.agreed_to_privacy_policy.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="has-text-weight-bold">
                    SU Covid regulations <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <b-checkbox required v-model="application.agreed_to_su_terms">
                    I declare that, I will NOT travel, pursuant to the regulation in force,
                    if at the time of travel: I am affected by Covid-19 or subjected to a
                    mandatory quarantine period of at least 14 days; I am suffering from a
                    fever with a temperature above 37,5°C; I have a persistent cough,
                    difficulty breathing, cold, sore throat, headache, severe weakness
                    (tiredness), decrease or loss of smell/taste, diarrhoea; I have had
                    close contact with a person affected by Covid-19 between 2 days before
                    the occurrence of symptoms and up to 14 days after the occurrence of
                    symptoms. I also undertake to inform the local organisers and Local
                    Health Authority of any possible occurrence of above mentioned symptoms
                    arising within eight days after the conclusion of the event.<br/>
                    Failure to present any mandatory documentation may result in my
                    participation in the event being denied by local authorities and/or
                    the local organisers and my entry being denied in the destination country.<br/>
                    I declare that I will indemnify any local of AEGEE against any and all
                    fines and/or costs the local may incur due to my failure to comply with
                    any of the above Covid-19 government requirements.<br/>
                    I confirm that I will comply with all country specific Covid-19 requirements
                    and the documents provided are valid and as required for travel. I understand
                    that I am required to have these documents available (digitally or in paper
                    format) for inspection by local authorities.
                  </b-checkbox>
                </div>
                <p class="help is-danger" v-if="errors.agreed_to_su_terms">{{ errors.agreed_to_su_terms.join(', ') }}</p>
              </div>

              <div class="field">
                <label class="has-text-weight-bold">
                    SU specific Covid regulations <span class="has-text-danger">*</span>
                </label>
                <div class="control">
                  <b-checkbox required>
                    I confirm that I have read and understood the regulations set up by the local organisers.
                  </b-checkbox>
                </div>
              </div>

              <div class="field">
                <button type="submit" class="button is-primary">
                  Save application!
                </button>
              </div>
            </div>
          </div>

          <!-- TODO: add fields here -->
          <div v-show="!isNew && !this.can.apply" class="tile is-parent">
            <div class="tile is-child">
              <p>
                <b>You applied from this body:</b>
                <router-link target="_blank" :to="{ name: 'oms.bodies.view', params: { id: application.body_id } }">
                  {{ application.body ? application.body.name : 'Loading...' }}
                </router-link>
              </p>
              <table class="table is-narrow is-fullwidth">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Your answer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(field, index) in event.questions" v-bind:key="index">
                    <td><b>{{ field.description }}</b><span class="is-danger" ng-show="field.required">*</span></td>
                    <td>{{ application.answers[index] | beautify }}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>
                        I agree with my personal data to be processed
                        by AEGEE-Europe for the purposes of the participant selection
                        and event organisation. AEGEE-Europe will disclose this data
                        to organising local for the time period of the event organisation.
                      </b>
                    </td>
                    <td>{{ application.agreed_to_privacy_policy | beautify }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="field" v-show="event.questions.length === 0">
                <div class="notification is-info">
                  You didn't need to fill in the application fields.
                </div>
              </div>
            </div>
          </div>

          <div class="tile is-parent" v-show="!isNew && !this.can.apply">
            <div class="tile is-child">
              <div class="notification is-warning" v-if="application.status === 'pending'">
                Your application is being processed, please wait for the organizers to evaluate your application. Unfortunately you can not edit it anymore.
              </div>
              <div class="notification is-success" v-else-if="application.status === 'accepted'">
                Congratulations, you have been accepted to the event!
              </div>
              <div class="notification is-success" v-else-if="application.status === 'rejected'">
                Sorry, but you were not accepted to the event.
              </div>
            </div>
          </div>

          <b-loading is-full-page="false" :active.sync="isLoading"></b-loading>
        </form>
      </div>
    </div>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import countries from '../../countries'
import nationalities from '../../nationalities'
import EventNoBodyNotification from '../../components/notifications/EventNoBodyNotification'

export default {
  name: 'ApplyToEvent',
  components: {
    EventNoBodyNotification
  },
  data () {
    return {
      event: {
        name: null,
        questions: []
      },
      bodies: [],
      application: {
        body: null,
        body_id: null,
        user: null,
        user_id: null,
        id: null,
        visa_required: false,
        answers: [],
        meals: '',
        allergies: '',
        agreed_to_privacy_policy: false
      },
      countries,
      nationalities,
      can: {
        apply: false
      },
      errors: {},
      isLoading: false,
      isSaving: false
    }
  },
  methods: {
    saveApplication () {
      if (!this.application.body_id) {
        return this.$root.showError('Please select a body.')
      }

      // Copy data from the form into an object to submit it in the format the backend needs it
      this.isSaving = true

      const request = this.isNew
        ? this.axios.post(this.services['summeruniversity'] + '/single/' + this.$route.params.id + '/applications', this.application)
        : this.axios.put(this.services['summeruniversity'] + '/single/' + this.$route.params.id + '/applications/' + this.$route.params.application_id, this.application)

      request.then(() => {
        this.$root.showSuccess('Your application was saved, you can still edit it until the application period ends')

        return this.$router.push({
          name: 'oms.summeruniversity.view',
          params: { id: this.event.url || this.event.id }
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
  },
  computed: {
    ...mapGetters({
      services: 'services',
      loginUser: 'user'
    }),
    isNew () {
      return !this.application.id
    }
  },
  mounted () {
    this.isLoading = true
    this.axios.get(this.services['summeruniversity'] + '/single/' + this.$route.params.id).then((response) => {
      this.event = response.data.data
      this.can = response.data.permissions

      this.bodies = this.loginUser.bodies.filter(b => ['antenna', 'contact antenna', 'contact'].includes(b.type))

      // Setting 1st body as an application body if possible
      if (this.bodies.length > 0) {
        this.application.body_id = this.bodies[0].id
      }

      return this.axios.get(this.services['summeruniversity'] + '/single/' + this.$route.params.id + '/applications/' + this.$route.params.application_id).then((application) => {
        this.application = application.data.data
        this.application.body = this.bodies.find(body => body.id === this.application.body_id)

        this.isLoading = false
      }).catch((err) => {
        this.isLoading = false
        // if there's no application, just ignore, otherwise re-throw the error
        if (err.response.status !== 404) {
          throw err
        }
      })
    }).catch((err) => {
      if (err.response.status === 404) {
        this.$root.showError('Event is not found')
      } else {
        this.$root.showError('Some error happened', err)
      }

      this.$router.push({ name: 'oms.summeruniversity.list' })
    })
  }
}
</script>