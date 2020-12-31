<template>
  <div style="width: 100%">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="loadingError">
      {{loadingError}}
    </div>
    <div v-else class="organizer-card">
      <div class="ui-card dash-card-large">
        <div style="overflow-x: auto; max-width: 100%">
          <table class="data-table-generic">
            <tr class="table-header">
              <td>NAME</td>
              <td># Registered</td>
              <td># Checked In</td>
              <td>Registration Open</td>
              <td>Check In Open</td>
            </tr>
            <router-link v-for="event in eventsData"
                         :to="{path: '/organizer/eventview?eventID='+event._id+'&returnPath=/organizer/events'}"
                         v-bind:key="event._id"
                         tag="tr">
              <td>
                {{event.name}}
              </td>
              <td>
                {{event.registeredUsers.length}}
              </td>
              <td>
                {{event.checkInData.length}}
              </td>
              <td>
                {{moment(event.dates.registrationOpen, "MM/DD/YYYY hh:mm a")}}
              </td>
              <td>
                {{moment(event.dates.checkInOpen, "MM/DD/YYYY hh:mm a")}}
              </td>
            </router-link>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'
import moment from 'moment'

export default {
  name: 'EventsAdmin',
  data() {
    return {
      user: Session.getUser(),
      loading: true,
      loadingError: "",
      eventsData: {}
    }
  },
  created() {

  },
  beforeMount() {
    ApiService.getAllEvents((err, data) => {
      this.loading = false;
      if (err || !data) {
        this.loadingError = err ? err.rawError.error : 'Unable to process request'
      } else {
        this.eventsData = data;
      }
    })
  },


  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    }
  }
}
</script>