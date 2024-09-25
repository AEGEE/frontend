<template>
  <div class="modal-card" style="height: 75vh">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ local.name }}</p>
      <button class="delete" aria-label="close" @click="$parent.close()" />
    </header>

    <section class="modal-card-body">
      <b-field label="From" horizontal>
        <b-input v-model="from" />
      </b-field>

      <b-field label="To" horizontal>
        <b-input v-model="to" />
      </b-field>

      <b-field label="Cc" horizontal>
        <b-input v-model="cc" />
      </b-field>

      <b-field label="Subject" horizontal>
        <b-input v-model="subject" />
      </b-field>

      <b-field label="Mail text">
        <b-input type="textarea" v-model="body" />
      </b-field>

      <hr />

      <h2 class="subtitle">Preview of full mail</h2>
      <span v-html="$options.filters.markdown(mail)" />

    </section>

    <footer class="modal-card-foot">
      <button class="button is-primary" @click="send()">Send</button>
      <button class="button" @click="$parent.close()">Cancel</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AntennaCriteriaMailSend',
  props: ['local', 'agora', 'mailComponents', 'permissions', 'services', 'showError', 'showSuccess', 'router'],
  data () {
    return {
      from: 'network@aegee.eu',
      to: '',
      cc: '',
      subject: '',
      body: ''
    }
  },
  methods: {
    send () {
      const data = {
        'from': this.from,
        'to': this.to,
        'cc': this.cc,
        'subject': this.subject,
        'reply_to': this.from,
        'template': this.mail
      }

      console.log(data)

      this.axios.post(
        this.services['network'] + '/antennaCriteria/sendFulfilmentMail',
        data
      ).then(() => {
        this.showSuccess('Mail sent succesfully.')
        this.router.go(0)
      }).catch((err) => {
        this.showError('Something went wrong', err)
      })
    }
  },
  computed: {
    mail () {
      return this.body.replaceAll('<r>', '<span style="color: red">').replaceAll('</r>', '</span>')
    }
  },
  mounted () {
    this.to = this.local.email
    this.cc = this.local.netcom.email // TODO: See how we can set this to always be an @aegee.eu account
    this.subject = 'Preliminary Antenna Criteria check ' + this.agora.name

    // Construct the complete mail based on the missing criteria
    const ordering = ['communication', 'board election', 'members list', 'membership fee', 'events', 'agora attendance', 'development plan', 'fulfilment report']
    const antennaCriteriaMapping = {
      'contact': ['communication'],
      'contact antenna': ['members list', 'membership fee'],
      'antenna': ordering
    }

    let rawMail = this.mailComponents.find(c => c.mail_component === 'introduction').text + '\n<br><br>\n'

    // Add all parts of the mail template that the Local is not fulfilling and should fulfil
    for (const part of antennaCriteriaMapping[this.local.type]) {
      const criterionName = part.replace(/ (\w)/g, (_, c) => c.toUpperCase())
      const criterionFulfilment = this.local.antennaCriteria[criterionName]
      if (criterionFulfilment !== 'true' && criterionFulfilment !== 'exception') {
        rawMail += this.mailComponents.find(c => c.mail_component === part).text
        rawMail += '\n<br><br>\n'
      }
    }
    rawMail += this.mailComponents.find(c => c.mail_component === 'closing').text

    // Replace the variables of the template with actual values
    this.body = rawMail
      .replaceAll('{body_name}', this.local.name)
      .replaceAll('{agora_name}', this.agora.name)
      .replaceAll('{netcom_name}', this.local.netcom.first_name)
      .replaceAll('{local_type}', this.local.type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      .replaceAll('{antenna_criteria_amount}', antennaCriteriaMapping[this.local.type].length)
  }
}
</script>
