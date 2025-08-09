<template>
  <div>
    <div class="content">
      <div class="tags">
        <span
          class="tag"
          v-for="(type, key) in constants.EVENT_TYPES_NAMES"
          :key="key"
          :style="{ 'background-color': colors[key], color: '#FFFFFF' }"
        >
          {{ type }}
        </span>
        <span class="tag" style="background-color: #1468c5; color: #ffffff"> Statutory </span>
        <span class="tag" style="background-color: #00bbd8; color: #ffffff">
          Summer University
        </span>
      </div>
      <div>
        Events starting with 🖥️ are online events
      </div>
    </div>

    <hr />

    <FullCalendar :options="calendarOptions" />

    <b-loading :is-full-page="true" :active.sync="isLoading" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import constants from '../../constants'

export default {
  name: 'CalendarEventsView',
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data () {
    return {
      colors: {
        training: '#A0C514',
        conference: '#931991',
        nwm: '#FBBA00',
        cultural: '#C51C13'
      },
      constants,
      isLoading: false,
      currentMonthStart: null,
      currentMonthEnd: null,
      calendarOptions: {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        eventDisplay: 'block',
        firstDay: 1,
        events: this.fetchEvents,
        displayEventTime: false,
        eventClick: this.eventClick
      }
    }
  },
  methods: {
    eventClick (info) {
      info.jsEvent.preventDefault() // don't let the browser navigate

      if (info.event.url !== '') { // If the event has a non-empty link field
        this.$buefy.dialog.confirm({
          title: info.event.title,
          message: '<strong>Starts: </strong>' + moment(info.event.start).format('D MMMM Y H:mm')
            + '</br><strong>Ends: </strong>' + moment(info.event.end).format('D MMMM Y H:mm')
            + (info.event.extendedProps.online ? '</br><em>This is an online event</em>' : '')
            + '<hr>' + this.$options.filters.markdown(info.event.extendedProps.description),
          canCancel: '[escape, button, outside]',
          confirmText: 'Event page',
          type: 'is-info',
          onConfirm: () => window.open(info.event.url, '_self')
        })
      } else { // If there is no link
        this.$buefy.dialog.alert({
          title: info.event.title,
          message: '<strong>Starts: </strong>' + moment(info.event.start).format('D MMMM Y H:mm')
            + '</br><strong>Ends: </strong>' + moment(info.event.end).format('D MMMM Y H:mm')
            + '<hr>' + info.event.extendedProps.description,
          canCancel: '[escape, outside]',
          confirmText: 'Cancel',
          type: 'is-light'
        })
      }
    },
    fetchEvents () {
      this.isLoading = true

      const eventsPromise = this.axios.get(this.services['events']).then((result) => {
        return result.data.data.map((event) => ({
          title: `${event.method === 'online' ? '🖥️ ' : ''}${event.name}`,
          start: new Date(event.starts),
          end: new Date(event.ends),
          backgroundColor: this.colors[event.type] || '#1468C5',
          borderColor: '#FFFFFF',
          textColor: '#FFFFFF',
          url: '/events/' + (event.url || event.id),
          description: event.description,
          online: event.method === 'online'
        }))
      }).catch((err) => {
        this.$root.showError('Could not load events list', err)
        return []
      })

      const summeruniversityPromise = this.axios.get(this.services['summeruniversity']).then((result) => {
        return result.data.data.map((event) => ({
          title: event.name,
          start: new Date(event.starts),
          end: new Date(event.ends),
          backgroundColor: '#00BBD8',
          borderColor: '#FFFFFF',
          textColor: '#FFFFFF',
          url: '/summeruniversity/' + (event.url || event.id),
          description: event.description
        }))
      }).catch((err) => {
        this.$root.showError('Could not load events list', err)
        return []
      })

      const statutoryPromise = this.axios.get(this.services['statutory']).then((result) => {
        return result.data.data.map((event) => ({
          title: event.name,
          start: new Date(event.starts),
          end: new Date(event.ends),
          backgroundColor: '#1468C5',
          borderColor: '#FFFFFF',
          textColor: '#FFFFFF',
          url: '/statutory/' + (event.url || event.id),
          description: event.description
        }))
      }).catch((err) => {
        this.$root.showError('Could not load statutory events list', err)
        return []
      })

      Promise.all([
        eventsPromise,
        summeruniversityPromise,
        statutoryPromise
      ]).then(([regular, summeruniversity, statutory]) => {
        this.calendarOptions.events = [...regular, ...summeruniversity, ...statutory]
        this.isLoading = false
      })
    }
  },
  computed: {
    ...mapGetters({
      loginUser: 'user',
      services: 'services'
    })
  }
}
</script>

<style>
.modal-card-title {
  width: 100%;
}
</style>
