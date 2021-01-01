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
        <div>
          <button class="generic-button-dark less-wide" @click="createEvent">Create New</button>
        </div>
        <div style="overflow-x: auto; max-width: 100%">
          <table class="data-table-generic">
            <tr class="table-header">
              <td>Name</td>
              <td>Date</td>
              <td># Registered</td>
              <td># Checked In</td>
              <td>Registration Open</td>
              <td>Check In Open</td>
              <td>Public</td>
              <td>Finish Date</td>
            </tr>
            <router-link v-for="event in eventsData"
                         :to="{path: '/organizer/eventview?eventID='+event._id+'&returnPath=/organizer/events'}"
                         v-bind:key="event._id"
                         tag="tr">
              <td>
                {{event.name}}
              </td>
              <td>
                {{moment(event.dates.event, "MM/DD/YYYY hh:mm a")}}
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
              <td>
                {{event.options.public}}
              </td>
              <td>
                {{event.dates.finished !== -1 ? moment(event.dates.finished, "MM/DD/YYYY hh:mm a") : "Never"}}
                {{event.dates.finished !== -1 && event.dates.finished < Date.now() ? "(Finished)" : ""}}
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
import Swal from "sweetalert2";

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
        this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
      } else {
        this.eventsData = data;
      }
    })
  },


  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    },
    convertDateEditStringToDate(string){
      return moment(string).unix() * 1000
    },
    createEvent(){
      Swal.fire({
        title: 'Enter Event Information',
        html: '<label for="eventEdit-name" class="text-left float-left">Name</label>' +
            '<input type="text" class="form-control" id="eventEdit-name" placeholder="Cool Event">' +

            '<label for="eventEdit-description" class="text-left float-left">Description</label>' +
            '<textarea type="text" class="form-control" id="eventEdit-description" placeholder="One of the coolest events in the galaxy."></textarea>' +

            '<label for="eventEdit-date" class="text-left float-left">DateTime (Unix)</label>' +
            `<input type="text" class="form-control" id="eventEdit-date" value="${moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss')}">`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('eventEdit-name').value, document.getElementById('eventEdit-description').value, this.convertDateEditStringToDate(document.getElementById('eventEdit-date').value)];
        }
      }).then((info) => {
        if(info.value){
          let eventName = info.value[0].trim();
          let eventDescription = info.value[1].trim();
          let eventDate = info.value[2];

          if(eventName === "" || eventDescription === "" || isNaN(eventDate)){
            return Swal.fire({
              title: 'Error',
              type: 'error',
              text: 'Invalid input. Please check the fields carefully.'
            }).then(() => {
              this.createEvent();
            });
          }

          ApiService.createEvent(eventName, eventDescription, eventDate, (err, data) => {
            if(err){
              return Swal.fire({
                title: 'Error',
                type: 'error',
                text: 'There was an error creating the event.'+ApiService.extractErrorText(err)
              });
            }
            Swal.fire({
              title: 'Success',
              text: `Successfully created event.`,
              type: 'success'
            }).then(() => {
              this.$router.push(`/organizer/eventview?eventID=${data.id}&returnPath=/organizer/events`);
            })
          })
        }

      })
    }
  }
}
</script>