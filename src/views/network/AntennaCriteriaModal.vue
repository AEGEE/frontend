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
            </select>
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
      permissions: [],
      can: {
        setCommunication: false,
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
        if (criterion === 'communication' && this.antennaCriteria[criterion] != this.local.communication) {
          promises.push(this.setAntennaCriterionFulfilment(criterion))
        }
      }

      await Promise.all(promises)

      this.isLoading = false
      // TODO: Close the modal
    },
    setAntennaCriterionFulfilment (criterion) {
      console.log(criterion, this.antennaCriteria[criterion])

      const data = {
        "agora_id": this.agora.id,
        "body_id": this.local.id,
        "antenna_criterion": criterion,
        "value": this.antennaCriteria[criterion] === 'null' ? null : this.antennaCriteria[criterion]
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
    })

    // Set the current fulfilment
    this.antennaCriteria.communication = this.local.communication

    this.isLoading = false
  }
}

</script>
