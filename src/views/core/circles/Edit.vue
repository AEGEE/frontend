<template>
  <div class="tile is-ancestor is-vertical">
    <div class="tile is-child">
      <form @submit.prevent="saveCircle()">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input class="input" type="text" required v-model="circle.name" />
          </div>
          <p class="help is-danger" v-if="errors.name">{{ errors.name.join(', ')}}</p>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <input class="input" type="text" required v-model="circle.description" />
          </div>
          <p class="help is-danger" v-if="errors.description">{{ errors.description.join(', ')}}</p>
        </div>

        <div class="field">
          <label class="label">Joinable?
            <input type="checkbox" class="checkbox" v-model="circle.joinable" />
          </label>
          <p class="help is-danger" v-if="errors.joinable">{{ errors.joinable.join(', ')}}</p>
        </div>

        <b-loading is-full-page="false" :active.sync="isLoading" />

        <div class="field">
          <div class="control">
            <input type="submit" value="Save circle" :disabled="isSaving" class="button is-primary is-fullwidth" />
          </div>
        </div>
      </form>
    </div>

    <hr />

    <div class="tile is-child" v-if="$route.params.id">
      <div class="field">
        <label class="label">Parent circle</label>
        <div class="control">
          <div class="field has-addons">
            <b-autocomplete
              v-model="autoComplete.parentCircle.name"
              :data="autoComplete.parentCircle.values"
              open-on-focus="true"
              :loading="autoComplete.parentCircle.loading"
              @input="query => fetchSomething(query, 'parentCircle', 'circles')"
              @select="childCircle => setParentCircle(childCircle)">
              <template slot-scope="props">
                <div class="media">
                  <div class="media-content">
                    {{ props.option.name }}
                    <br>
                    <small> {{ props.option.description }} </small>
                  </div>
                </div>
              </template>
            </b-autocomplete>
            <p class="control">
              <a
                class="button is-danger"
                @click="setParentCircle(null)"
                v-if="circle.parent_circle">{{ circle.parent_circle.name }} (Click to unset)</a>
              <a class="button is-static" v-if="!circle.parent_circle">Not set.</a>
            </p>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Child circles</label>
        <ul>
          <li v-for="childCircle in circle.child_circles" v-bind:key="childCircle.id">
            <span class="tag is-danger">{{ childCircle.name }}
              <button class="delete is-small" @click="unsetAsParentCircle(childCircle)" />
            </span>
          </li>
          <li v-if="circle.child_circles.length === 0">
            <i>No child circles attached.</i>
          </li>
        </ul>
      </div>

      <div class="field">
        <label class="label">Add child circle</label>
        <div class="control">
          <div class="field has-addons">
            <b-autocomplete
              v-model="autoComplete.childCircles.name"
              :data="autoComplete.childCircles.values"
              open-on-focus="true"
              :loading="autoComplete.childCircles.loading"
              @input="query => fetchSomething(query, 'childCircles', 'circles')"
              @select="childCircle => setAsParentCircle(childCircle)">
              <template slot-scope="props">
                <div class="media">
                  <div class="media-content">
                    {{ props.option.name }}
                    <br>
                    <small> {{ props.option.description }} </small>
                  </div>
                </div>
              </template>
            </b-autocomplete>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Attached permissions</label>
        <ul>
          <li v-for="permission in circle.permissions" v-bind:key="permission.id">
            <span class="tag is-danger">{{ permission.combined }}
              <button class="delete is-small" @click="deletePermission(permission)" />
            </span>
          </li>
          <li v-if="circle.permissions.length === 0">
            <i>No permissions attached.</i>
          </li>
        </ul>
      </div>

      <div class="field">
        <label class="label">Add permission</label>
        <div class="control">
          <div class="field has-addons">
            <b-autocomplete
              v-model="autoComplete.permissions.name"
              :data="autoComplete.permissions.values"
              open-on-focus="true"
              :loading="autoComplete.permissions.loading"
              @input="query => fetchSomething(query, 'permissions', 'permissions')"
              @select="permission => addPermission(permission)">
              <template slot-scope="props">
                <div class="media">
                  <div class="media-content">
                    {{ props.option.combined }}
                    <br>
                    <small> {{ props.option.description }} </small>
                  </div>
                </div>
              </template>
            </b-autocomplete>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'EditCircle',
  data () {
    return {
      circle: {
        name: '',
        description: '',
        id: null,
        child_circles: [],
        permissions: [],
        body: null,
        body_id: null,
        parent_circle: null,
        parent_circle_id: null
      },
      autoComplete: {
        parentCircle: { name: '', values: [], loading: false },
        childCircles: { name: '', values: [], loading: false },
        permissions: { name: '', values: [], loading: false }
      },
      token: null,
      errors: {},
      isLoading: false,
      isSaving: false
    }
  },
  computed: mapGetters(['services']),
  methods: {
    fetchSomething (query, key, context) {
      if (!query) return

      this.autoComplete[key].values = []
      this.autoComplete[key].loading = true

      if (this.token) this.token.cancel()
      this.token = this.axios.CancelToken.source()

      this.axios.get(this.services['core'] + '/' + context, {
        cancelToken: this.token.token,
        params: { query }
      }).then((response) => {
        this.autoComplete[key].values = response.data.data
        this.autoComplete[key].loading = false
      }).catch((err) => {
        if (this.axios.isCancel(err)) {
          return
        }

        this.autoComplete[key].loading = false

        this.$root.showError('Could not fetch ' + context + 's', err)
      })
    },
    setParentCircle (circle) {
      this.autoComplete.parentCircle.loading = true
      this.axios.put(this.services['core'] + '/circles/' + this.$route.params.id + '/parent', {
        parent_circle_id: circle ? circle.id : null
      }).then(() => {
        this.autoComplete.parentCircle.loading = false
        this.circle.parent_circle = circle
        this.circle.parent_circle_id = circle ? circle.id : null

        this.$root.showSuccess('Parent circle is ' + (circle ? 'set.' : 'unset.'))
      }).catch((err) => {
        this.autoComplete.parentCircle.loading = false

        if (err.response.status === 422) {
          const errors = Object.keys(err.response.data.errors).map(key => err.response.data.errors[key].join(',')).join(',')
          return this.$root.showError('Could not ' + (circle ? 'set' : 'unset') + ' parent circle: ' + errors)
        }

        this.$root.showError('Could not ' + (circle ? 'set' : 'unset') + ' parent circle', err)
      })
    },
    addPermission (permission) {
      this.autoComplete.permissions.loading = true

      this.axios.post(this.services['core'] + '/circles/' + this.$route.params.id + '/permissions', {
        permission_id: permission.id
      }).then(() => {
        this.autoComplete.permissions.loading = false
        this.circle.permissions.push(permission)

        this.$root.showSuccess('Permission is added.')
      }).catch((err) => {
        this.autoComplete.permissions.loading = false

        if (err.response.status === 422) {
          const errors = Object.keys(err.response.data.errors).map(key => err.response.data.errors[key].join(',')).join(',')
          return this.$root.showError('Could not add permission: ' + errors)
        }

        this.$root.showError('Could not add permission', err)
      })
    },
    deletePermission (permission) {
      this.autoComplete.permissions.loading = true

      this.axios.delete(this.services['core'] + '/circles/' + this.$route.params.id + '/permissions/' + permission.id).then(() => {
        this.autoComplete.permissions.loading = false
        const index = this.circle.permissions.findIndex(perm => perm.id === permission.id)
        this.circle.permissions.splice(index, 1)

        this.$root.showSuccess('Permission is deleted.')
      }).catch((err) => {
        this.autoComplete.permissions.loading = false

        if (err.response.status === 422) {
          const errors = Object.keys(err.response.data.errors).map(key => err.response.data.errors[key].join(',')).join(',')
          return this.$root.showError('Could not delete permission: ' + errors)
        }

        this.$root.showError('Could not delete permission', err)
      })
    },
    setAsParentCircle (circle) {
      this.autoComplete.childCircles.loading = true

      this.axios.put(this.services['core'] + '/circles/' + circle.id + '/parent', {
        parent_circle_id: this.circle.id
      }).then(() => {
        this.autoComplete.childCircles.loading = false
        this.circle.child_circles.push(circle)

        this.$root.showSuccess('Child circle is added.')
      }).catch((err) => {
        this.autoComplete.childCircles.loading = false
        if (err.response.status === 422) {
          const errors = err.response.data.errors
            ? Object.keys(err.response.data.errors).map(key => err.response.data.errors[key].join(',')).join(',')
            : err.response.data.message
          return this.$root.showError('Could not add child circle: ' + errors)
        }

        this.$root.showError('Could not add child circle', err)
      })
    },
    unsetAsParentCircle (circle) {
      this.autoComplete.childCircles.loading = true

      this.axios.put(this.services['core'] + '/circles/' + circle.id + '/parent', {
        parent_circle_id: null
      }).then(() => {
        this.autoComplete.childCircles.loading = false

        const index = this.circle.child_circles.findIndex(newCircle => newCircle.id === circle.id)
        this.circle.child_circles.splice(index, 1)

        this.$root.showSuccess('Child circle is removed')
      }).catch((err) => {
        this.autoComplete.childCircles.loading = false

        if (err.response.status === 422) {
          const errors = err.response.data.errors
            ? Object.keys(err.response.data.errors).map(key => err.response.data.errors[key].join(',')).join(',')
            : err.response.data.message
          return this.$root.showError('Could not remove child circle: ' + errors)
        }

        this.$root.showError('Could not remove child circle', err)
      })
    },
    saveCircle () {
      this.isSaving = true
      this.errors = {}

      const body = _.pick(this.circle, [
        'name',
        'description'
      ])

      const promise = this.$route.params.id
        ? this.axios.put(this.services['core'] + '/circles/' + this.$route.params.id, body)
        : this.axios.post(this.services['core'] + '/circles/', body)

      promise.then((response) => {
        this.isSaving = false

        this.$root.showSuccess('Circle is saved.')

        return this.$router.push({
          name: 'oms.circles.view',
          params: { id: response.data.data.id }
        })
      }).catch((err) => {
        this.isSaving = false

        if (err.response.status === 422) { // validation errors
          this.errors = err.response.data.errors
          return this.$root.showError('Some of the circle data is invalid.')
        }

        this.$root.showError('Could not save circle', err)
      })
    }
  },
  mounted () {
    if (!this.$route.params.id) {
      return // if creating new circle
    }

    this.isLoading = true
    this.axios.get(this.services['core'] + '/circles/' + this.$route.params.id).then((response) => {
      this.circle = response.data.data
      this.isLoading = false
    }).catch((err) => {
      if (err.response.status === 404) {
        this.$root.showError('Circle is not found')
      } else {
        this.$root.showError('Some error happened', err)
      }

      this.$router.push({ name: 'oms.circles.list' })
    })
  }
}
</script>
