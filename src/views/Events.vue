<template>
  <div class="app-screen">
    <div class="container">
      <div class="row">
        <div class="title-card col-md-12">
          <h2>EVENTS</h2>
        </div>
      </div>

      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Events You're Registered For</h3>
          <hr>
          <div style="overflow-x: auto; max-width: 100%">
            <table class="data-table-generic">
              <tr class="table-header">
                <td>NAME</td>
                <td>DESCRIPTION</td>
                <td>DATE</td>
                <td>CHECK IN OPEN</td>
                <td>CHECK IN CLOSE</td>
                <td>CHECK IN</td>
                <td>DETAILS</td>
              </tr>
              <tr v-for="event in registeredEvents">
                <td>
                  {{event.name}}
                </td>
                <td>
                  {{event.description}}
                </td>
                <td>
                  {{moment(event.dates.event, "MM/DD/YYYY hh:mm a")}}
                </td>
                <td>
                  {{moment(event.dates.checkInOpen, "MM/DD/YYYY hh:mm a")}}
                </td>
                <td>
                  {{event.dates.checkInClose !== -1 ? moment(event.dates.checkInClose, "MM/DD/YYYY hh:mm a") : "N/A"}}
                </td>
                <td>
                  <button class="generic-button-dark less-wide" @click="checkInEvent(event.id)" :disabled="event.dates.checkInOpen >= Date.now() || (event.dates.checkInClose !== -1 && event.dates.checkInClose <= Date.now()) || isCheckedIn[event.id]">
                    {{isCheckedIn[event.id] ? "Check In Done" : "Check In"}}
                  </button>
                </td>
                <td>
                  <router-link :to="{path: '/eventdetails?eventID='+event.id+ '&checkedIn='+isCheckedIn[event.id]}">
                    <button class="generic-button-dark less-wide">Details</button>
                  </router-link>
                </td>
              </tr>

            </table>
          </div>
        </div>
      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Other Events</h3>
          <hr>
          <div style="overflow-x: auto; max-width: 100%">
            <table class="data-table-generic">
              <tr class="table-header">
                <td>NAME</td>
                <td>DESCRIPTION</td>
                <td>DATE</td>
                <td>REGISTRATION OPEN</td>
                <td>REGISTRATION CLOSE</td>
                <td>REGISTER</td>
              </tr>
              <tr v-for="event in otherEvents">
                <td>
                  {{event.name}}
                </td>
                <td>
                  {{event.description}}
                </td>
                <td>
                  {{moment(event.dates.event, "MM/DD/YYYY hh:mm a")}}
                </td>
                <td>
                  {{moment(event.dates.registrationOpen, "MM/DD/YYYY hh:mm a")}}
                </td>
                <td>
                  {{event.dates.registrationClose !== -1 ? moment(event.dates.registrationClose, "MM/DD/YYYY hh:mm a") : "N/A"}}
                </td>
                <td>
                  <button class="generic-button-dark less-wide" @click="registerEvent(event.id)" :disabled="event.dates.registrationOpen >= Date.now() || (event.options.maxRegistrations !== -1 && event.registeredUsers.length >= event.options.maxRegistrations)">
                    {{event.options.maxRegistrations !== -1 ? (event.registeredUsers.length >= event.options.maxRegistrations ? "Full" : "Register") : "Register"}}
                  </button>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Past Events</h3>
          <hr>
          <div style="overflow-x: auto; max-width: 100%">
            <table class="data-table-generic">
              <tr class="table-header">
                <td>NAME</td>
                <td>DATE</td>
                <td>DETAILS</td>
              </tr>
              <tr v-for="event in pastEvents">
                <td>
                  {{event.name}}
                </td>
                <td>
                  {{moment(event.dates.event, "MM/DD/YYYY hh:mm a")}}
                </td>
                <td>
                  <router-link :to="{path: '/eventdetails?eventID='+event.id+ '&checkedIn='+isCheckedIn[event.id]}">
                    <button class="generic-button-dark less-wide">Details</button>
                  </router-link>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Manual Registration</h3>
          <p>Have a code for a non-public event?</p>
          <hr>
          <button @click="registerByID" class="generic-button-dark less-wide">Input Code</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '../ApiService';
import Session from '../Session';
import Swal from 'sweetalert2';
import moment from 'moment';

export default {
  name: "Events",
  data() {
    return {
      userObj: Session.getUser(),
      eventsData: {},
      isCheckedIn: {}
    }
  },
  beforeMount() {
    ApiService.getFilteredEvents((err, data) => {
      if(err){
        Swal.fire({
          title: 'Error',
          type: 'error',
          text: 'There was an error loading events.' + ApiService.extractErrorText(err)
        })
      }
      else{
        let eventsObj = {}
        for(let event of data){
          eventsObj[event.id] = event;
        }
        this.eventsData = eventsObj;
        this.generateCheckedIn();
      }

    })
  },
  computed: {
    otherEvents() {
      let events = {}
      for (const event of Object.keys(this.eventsData)){
        if(this.eventsData[event].dates.finished === -1 || this.eventsData[event].dates.finished > Date.now()){
          if(this.eventsData[event].registeredUsers.indexOf(this.userObj.id) === -1){
            events[event] = this.eventsData[event];
          }
        }

      }
      return events;
    },
    registeredEvents() {
      let events = {}
      for (const event of Object.keys(this.eventsData)){
        if(this.eventsData[event].dates.finished === -1 || this.eventsData[event].dates.finished > Date.now()){
          if(this.eventsData[event].registeredUsers.indexOf(this.userObj.id) !== -1 || !this.eventsData[event].options.mustRegisterBeforeCheckIn){
            events[event] = this.eventsData[event];
          }
        }
      }
      return events;
    },
    pastEvents() {
      let events = {}
      for (const event of Object.keys(this.eventsData)){
        if(this.eventsData[event].dates.finished !== -1 && this.eventsData[event].dates.finished < Date.now() && this.isCheckedIn[event]){
          events[event] = this.eventsData[event];
        }
      }
      return events;
    }
  },
  methods: {
    moment(date, format = "LLLL") {
      return moment(date).format(format)
    },
    registerByID() {
      Swal.fire({
        title: 'Please enter the event ID',
        input: 'text'
      }).then((info) => {
        if(info.value !== undefined){
          this.registerEvent(info.value, true);
        }
      })
    },
    registerEvent(eventID, hidden=false){
      Swal.fire({
        title: 'Are you sure?',
        type: 'question',
        text: `Are you sure you want to register for ${hidden ? "this event" : this.eventsData[eventID].name}?`,
        showCancelButton: true,
        cancelButtonColor: '#d33'
      }).then((info) => {
        if(info.value){
          ApiService.registerForEvent(this.userObj.id, eventID, (err, data)=> {
            if(err){
              Swal.fire({
                title: 'Error',
                type: 'error',
                text: 'There was an error registering for the event.'+ApiService.extractErrorText(err)
              })
            }
            else{
              Swal.fire({
                title: 'Success',
                type: 'success',
                text: `Successfully registered for ${hidden ? "the event" : this.eventsData[eventID].name}.`
              }).then(() => {
                // update cache
                if(hidden){
                  this.$router.go();
                }
                else{
                  this.eventsData[eventID].registeredUsers.push(this.userObj.id);
                }

              })
            }
          })
        }
      })
    },

    checkInEvent(eventID){
      Swal.fire({
        title: 'Are you sure?',
        type: 'question',
        text: `Are you sure you want to check in to ${this.eventsData[eventID].name}? You will no longer be able to unregister.`,
        showCancelButton: true,
        cancelButtonColor: '#d33'
      }).then((info) => {
        if(info.value){
          if(this.eventsData[eventID].options.checkInCodeRequired && !this.userObj.permissions.admin){
            Swal.fire({
              title: 'Please enter the check in code',
              input: 'text'
            }).then((info) => {
              if(info.value !== undefined){
                this.fireCheckInRequest(eventID, info.value);
              }
            })
          }
          else{
            this.fireCheckInRequest(eventID)
          }

        }
      })
    },

    fireCheckInRequest(eventID, checkInCode=""){
      ApiService.checkInEvent(this.userObj.id, eventID, checkInCode, (err, data)=> {
        if(err){
          Swal.fire({
            title: 'Error',
            type: 'error',
            text: 'There was an error checking in to the event.'+ApiService.extractErrorText(err)
          })
        }
        else{
          Swal.fire({
            title: 'Success',
            type: 'success',
            text: `Successfully checked in to ${this.eventsData[eventID].name}. You will no longer be able to unregister.`
          }).then(() => {
            // update cache
            this.isCheckedIn[eventID] = true;
          })
        }
      })
    },
    generateCheckedIn() {
      let events = {};
      for(const event of Object.keys(this.eventsData)){
        events[event] = false;
        for (let user of this.eventsData[event].checkInData){
          if(user.checkedInUser === this.userObj.id){
            events[event] = true;
            break;
          }
        }
      }
      this.isCheckedIn = events;
    }
  }
}
</script>

<style scoped>

</style>