<template>
  <div class="app-screen">
    <div class="container">
      <div class="row">
        <div class="title-card col-md-12">
          <h2>EVENT DETAILS</h2>
          <h4 class="mb-4">{{eventObj.name}}</h4>
          <router-link :to="{path: returnPath}">
            <button class="generic-button-dark less-wide">Back</button>
          </router-link>
          <button class="generic-button-dark less-wide" v-if="!eventCheckedIn" @click="unregisterEvent(eventID)">Unregister</button>
        </div>
      </div>
      <div style="padding-bottom: 30px" v-if="!userObj.permissions.admin">
        <div class="ui-card dash-card-offset dash-card dash-card-large" v-html="eventMessage">
        </div>
      </div>
      <div v-if="userObj.permissions.admin">
        <div style="padding-bottom: 30px" v-for="message in pastMessages">
          <div class="ui-card dash-card-offset dash-card dash-card-large" v-html="message">
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import Session from "../Session";
import ApiService from "../ApiService";

import Swal from 'sweetalert2';
export default {
  name: "EventDetails",
  data() {
    return {
      userObj: Session.getUser(),
      eventMessage: "Loading...",
      pastMessages: {
      },
      eventID: "",
      returnPath: "/events",
      eventCheckedIn: false,
      eventObj: {}
    }
  },
  beforeMount() {
    if (this.$route.query["returnPath"]) {
      this.returnPath = this.$route.query["returnPath"]
    }
    this.eventID = this.$route.query["eventID"];
    this.eventCheckedIn = this.$route.query["checkedIn"].toLowerCase() === "true";

    ApiService.getEventByID(this.eventID, (err, data) => {
      if(err){
        Swal.fire({
          title: 'Error',
          text: 'There was an error retrieving event data.' + ApiService.extractErrorText(err),
          type: 'error'
        })
      }
      else {
        this.eventObj = data;

        ApiService.getEventMessages(this.eventID, (err, data) => {
          if(err){
            Swal.fire({
              title: 'Error',
              text: 'There was an error retrieving event messages.' + ApiService.extractErrorText(err),
              type: 'error'
            })
          }
          else {
            if(this.eventObj.dates.finished !== -1 && this.eventObj.dates.finished < Date.now()){
              this.eventMessage = data.finished;
            }
            else if(data.checkedIn){
              this.eventMessage = data.checkedIn
            }
            else {
              this.eventMessage = data.registered
            }

            if(this.userObj.permissions.admin){
              this.pastMessages = data;
            }

          }
        });

      }
    })



  },
  methods: {
    unregisterEvent(eventID){
      Swal.fire({
        title: 'Are you sure?',
        type: 'question',
        text: `Are you sure you want to unregister from ${this.eventObj.name}?`,
        showCancelButton: true,
        cancelButtonColor: '#d33'
      }).then((info) => {
        if(info.value){
          ApiService.unregisterFromEvent(this.userObj.id, eventID, (err, data)=> {
            if(err){
              Swal.fire({
                title: 'Error',
                type: 'error',
                text: 'There was an error unregistering from the event.'+ApiService.extractErrorText(err)
              })
            }
            else{
              Swal.fire({
                title: 'Success',
                type: 'success',
                text: `Successfully unregistered from ${this.eventObj.name}.`
              }).then(() => {
                // remove from cache
                this.$router.push(this.returnPath);
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>