<template>
  <div class="content has-text-centered register-block">
    <div class="columns is-vcentered">
      <div class="column is-6 is-offset-3">
        <div class="box">
          <div class="field" v-if="campaign.autojoin_body">
            <label class="label">Register on MyAEGEE for {{ campaign.autojoin_body.name }}</label>
            <p>With this form you will be registering on MyAEGEE and automatically become a member of {{ campaign.autojoin_body.name }} after you have confirmed your email.</p>
            <p><span v-html="$options.filters.markdown(campaign.description_long)" /></p>
            <p v-if="campaign.autojoin_body.email">If you have any questions, you can contact {{ campaign.autojoin_body.name }} at {{ campaign.autojoin_body.email }}.</p>
          </div>
          <div class="field" v-if="!campaign.autojoin_body">
            <label class="label">Register on MyAEGEE</label>
            <p>With this form you will be registering on MyAEGEE. You will not become a member of a local yet, but you can make a join request after you have confirmed your email.</p>
          </div>

          <hr />
          <form v-on:submit.prevent="register">
            <div class="field">
              <label class="label">Username <span class="has-text-danger">*</span></label>
              <div class="control">
                <input
                  v-model="user.username"
                  required
                  class="input"
                  type="text"
                  pattern="^(?![0-9._-]*$)[a-zA-Z0-9._-]+$"
                  data-cy="username"
                  title="Username can only contain English letters, numbers, dots and dashes and should contain at least 1 letter."
                  placeholder="You will be able to login with it." />
              </div>
              <p class="help is-danger" v-if="errors.username">{{ errors.username.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">Email <span class="has-text-danger">*</span></label>
              <div class="control">
                <input
                  v-model="user.email"
                  required
                  class="input"
                  type="email"
                  data-cy="email"
                  placeholder="Email address the system will send emails to.">
              </div>
              <p class="help is-danger" v-if="errors.email">{{ errors.email.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">Password <span class="has-text-danger">*</span></label>
              <div class="control">
                <input v-model="user.password" data-cy="password" required class="input" type="password" minlength="8" placeholder="Type a secure password.">
              </div>
              <p class="help is-danger" v-if="errors.password">{{ errors.password.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">Password confirmation <span class="has-text-danger">*</span></label>
              <div class="control">
                <input v-model="user.password_copy" required data-cy="password-confirmation" class="input" type="password" minlength="8" placeholder="Repeat your password.">
              </div>
              <p class="help is-danger" v-if="errors.password_copy">{{ errors.password_copy.join(', ')}}</p>
            </div>

            <hr />

            <div class="field">
              <label class="label">First name <span class="has-text-danger">*</span></label>
              <div class="control">
                <input v-model="user.first_name" required data-cy="first-name" class="input" type="text" placeholder="E.g. Stephen">
              </div>
              <p class="help is-danger" v-if="errors.first_name">{{ errors.first_name.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">Last name <span class="has-text-danger">*</span></label>
              <div class="control">
                <input v-model="user.last_name" required data-cy="last-name" class="input" type="text" placeholder="E.g. Hawking">
              </div>
              <p class="help is-danger" v-if="errors.last_name">{{ errors.last_name.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">Phone</label>
              <div class="control has-icons-left">
                <span class="icon is-small is-left"><font-awesome-icon icon="phone" /></span>
                <input class="input" data-cy="phone" type="text" v-model="user.phone" />
              </div>
              <p class="help is-danger" v-if="errors.phone">{{ errors.phone.join(', ')}}</p>
            </div>

            <div class="field" data-cy="date_of_birth">
              <label class="label">Birthday</label>
              <b-datepicker :date-formatter="formatDate" :date-parser="parseDate" v-model="birthday" @input="transformBirthday()" />
              <p class="help is-danger" v-if="errors.date_of_birth">{{ errors.date_of_birth.join(', ')}}</p>
            </div>

            <select-or-custom v-model="user.gender" data-cy="gender" :values="['Male', 'Female']" label="Gender">
              <template slot="errors-slot">
                <p class="help is-danger" v-if="errors.gender">{{ errors.gender.join(', ')}}</p>
              </template>
            </select-or-custom>

            <div class="field">
              <label class="label">Address</label>
              <div class="control">
                <input class="input" data-cy="address" type="text" v-model="user.address" />
              </div>
              <p class="help is-danger" v-if="errors.address">{{ errors.address.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="label">About me</label>
              <div class="control">
                <input class="input" data-cy="about_me" type="text" v-model="user.about_me" />
              </div>
              <p class="help is-danger" v-if="errors.about_me">{{ errors.about_me.join(', ')}}</p>
            </div>

            <div class="field">
              <label class="checkbox">
                I agree to the <router-link :to="{ name: 'oms.confluence', params: { page_id: 'terms-of-service' } }">Privacy Policy <span class="has-text-danger">*</span> </router-link>
                <input type="checkbox" required data-cy="agree-to-privacy-policy" v-model="agreedToPrivacyPolicy" />
              </label>
              <p class="help is-danger" v-if="errors.agreedToPrivacyPolicy">{{ errors.agreedToPrivacyPolicy.join(', ')}}</p>
            </div>

            <hr />
            <p class="control">
              <button type="submit" class="button is-primary">Register</button>
              <router-link :to="{ name: 'oms.login' }" class="button">Login</router-link>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'Register',
  data () {
    return {
      user: {
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: null,
        gender: null,
        phone: null,
        privacy_consent: null,
        address: null,
        about_me: null
      },
      campaign: {
        name: '',
        description_long: '',
        id: null,
        autojoin_body: null,
        active: null
      },
      birthday: null,
      agreedToPrivacyPolicy: false,
      errors: {}
    }
  },
  computed: mapGetters(['services']),
  methods: {
    /* istanbul ignore next */
    parseDate (date) {
      return moment(date, 'YYYY-MM-DD').toDate()
    },
    formatDate (date) {
      return moment(date).format('YYYY-MM-DD')
    },
    transformBirthday () {
      this.user.date_of_birth = moment(this.birthday).format('YYYY-MM-DD')
    },
    register () {
      this.errors = {}

      if (!this.agreedToPrivacyPolicy) {
        this.errors.agreedToPrivacyPolicy = ['You need to agree with our Privacy Policy.']
        return
      }

      if (this.user.password !== this.user.password_copy) {
        this.errors.password = ['Passwords do not match.']
        return
      }

      this.user.privacy_consent = moment().format()

      const body = _.pick(this.user, [
        'username',
        'password',
        'first_name',
        'last_name',
        'email',
        'date_of_birth',
        'gender',
        'phone',
        'privacy_consent',
        'address',
        'about_me'
      ])

      this.axios.post(this.services['core'] + '/signup/' + this.$route.params.id, body).then(() => {
        this.$root.showSuccess('Your submission is registered.')
        return this.$router.push({ name: 'oms.confirm_token' })
      }).catch((err) => {
        if (err.response.status === 422) { // validation errors
          this.errors = err.response.data.errors
          return this.$root.showError('Some of the registration data is invalid.')
        }

        if (err.response.status === 404) {
          return this.$root.showError('The registration campaign is not found.')
        }

        this.$root.showError('Could not register', err)
      })
    }
  },
  mounted () {
    this.isLoading = true
    this.axios.get(this.services['core'] + '/campaigns/' + this.$route.params.id).then((response) => {
      this.campaign = response.data.data
    }).then(
      this.isLoading = false
    ).catch((err) => {
      if (err.response && err.response.status === 404) {
        this.$root.showError('Campaign is not found')
      } else {
        this.$root.showError('Some error happened', err)
      }

      this.$router.push({ name: 'oms.login' })
    })
  }
}
</script>

<style lang="scss" scoped>
.register-block {
  width: 100%
}
</style>
