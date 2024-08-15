<template>
  <div class="modal-card" style="height: 75vh">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ local.name }}</p>
      <button class="delete" aria-label="close" @click="$parent.close()" />
    </header>

    <section class="modal-card-body">
      <!-- <template v-if="can.setCommunication"> -->
        <div class="field">
          <label class="label">Communication (C)</label>
          <div class="select">
            <select v-model="antennaCriteria.communication">
              <option value=null>Not set</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <!-- TODO: Make sure that only the ND has this option, and not NetCom -->
              <option value="exception">Exception</option> 
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Comment</label>
          <div class="control">
            <b-input type="textarea" v-model="comments.communication" />
          </div>
        </div>
      <!-- </template> -->

      <!-- TODO: Add the other Antenna Criteria here -->

      <!-- <template v-if="can.setAgoraAttendance"> -->
        <div class="field">
          <label class="label">Agora attendance (AA)</label>
          <div class="select">
            <select v-model="antennaCriteria.agoraAttendance">
              <option value="null">Not set</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <!-- TODO: Make sure that only the ND has this option -->
              <option value="exception">Exception</option> 
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Comment</label>
          <div class="control">
            <b-input type="textarea" v-model="comments.agoraAttendance" />
          </div>
        </div>
      <!-- </template> -->

      <!-- <template v-if="can.approveDevelopmentPlan"> -->
        <div class="field">
          <label class="label">Development plan (DP)</label>
          <div class="select">
            <select v-model="antennaCriteria.developmentPlan">
              <option value="null">Not set</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <option value="exception">Exception</option> 
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Comment</label>
          <div class="control">
            <b-input type="textarea" v-model="comments.developmentPlan" />
          </div>
        </div>
      <!-- </template> -->

      <!-- <template v-if="can.approveFulfilmentReport"> -->
        <div class="field">
          <label class="label">Fulfilment report (FR)</label>
          <div class="select">
            <select v-model="antennaCriteria.fulfilmentReport">
              <option value="null">Not set</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <option value="exception">Exception</option> 
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label">Comment</label>
          <div class="control">
            <b-input type="textarea" v-model="comments.fulfilmentReport" />
          </div>
        </div>
      <!-- </template> -->

    </section>

    <footer class="modal-card-foot">
      <button class="button is-primary" @click="save()">Save</button>
      <button class="button" @click="$parent.close()">Cancel</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AntennaCriteriaModal',
  props: ['local', 'agora', 'services', 'showError', 'showSuccess', 'router'],
  data () {
    return {
      antennaCriteria: {
        communication: null,
        boardElection: null,
        membersList: null,
        membershipFee: null,
        events: null,
        agoraAttendance: null,
        developmentPlan: null,
        fulfilmentReport: null
      },
      comments: {
        communication: '',
        boardElection: '',
        membersList: '',
        membershipFee: '',
        events: '',
        agoraAttendance: '',
        developmentPlan: '',
        fulfilmentReport: ''
      },
      permissions: [],
      can: {
        setCommunication: false,
        setAgoraAttendace: false,
        giveExceptions: false
      },
      isLoading: false
    }
  },
  methods: {
    async save () {
      this.isLoading = true
      const promises = []
      for (const criterion in this.antennaCriteria) {
        if (this.antennaCriteria[criterion] != this.local.antennaCriteria[criterion] || this.comments[criterion] != this.local.comments[criterion]) {
          promises.push(this.setAntennaCriterionFulfilment(criterion))
        }
      }

      await Promise.all(promises)

      this.isLoading = false
      // TODO: Close the modal
    },
    setAntennaCriterionFulfilment (criterion) {
      // Convert camelCase to seperate, lower-case words
      const criterionName = criterion.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
      console.log(criterion, this.antennaCriteria[criterion], this.comments[criterion])

      const data = {
        "agora_id": this.agora.id,
        "body_id": this.local.id,
        "antenna_criterion": criterionName,
        "value": this.antennaCriteria[criterion] === 'null' ? null : this.antennaCriteria[criterion],
        "comment": this.comments[criterion]
      }

      this.axios.put(
        this.services['network'] + '/antennaCriteria',
        data
      )
    }
  },
  mounted () {
    this.isLoading = true
    this.axios.get(this.services['core'] + '/my_permissions').then((permissionResponse) => {
      this.permissions = permissionResponse.data.data
      this.can.setCommunication = this.permissions.some(permission => permission.combined.endsWith('manage_network:communication'))
      // this.can.approveDevelopmentPlan = "is ND"
      // this.can.approveFulfilmentReport = "is ND"
    })

    // Set the current fulfilment and comments
    for (const criterion in this.local.antennaCriteria) {
      this.antennaCriteria[criterion] = this.local.antennaCriteria[criterion]
      this.comments[criterion] = this.local.comments[criterion]
    }

    this.isLoading = false
  }
}

</script>
