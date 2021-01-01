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
        <h3>{{eventObj.name}}</h3>

        <h4>INFO</h4>
        <div class="duo-col">
          <ul style="overflow-wrap: break-word; text-align: left; list-style: none">
            <li>
              <br>
              <b>Description</b><br>{{eventObj.description}}<br>
            </li>
            <li>
              <br><br>
            </li>
          </ul>
        </div>

        <hr>

        <h4>OPTIONS</h4>
        <PropertyDisplayList :display-object="eventObj.options" neg-one-replacement="N/A"></PropertyDisplayList>

        <hr>

        <h4>DATES</h4>
        <PropertyDisplayList :display-object="eventObj.dates" neg-one-replacement="Never" parse-as-dates="true"></PropertyDisplayList>

        <hr>


        <h4>MESSAGES</h4>
        <PropertyDisplayList :display-object="eventObj.messages"></PropertyDisplayList>

        <hr>

        <router-link :to="{path: returnPath}">
          <button class="generic-button-dark less-wide">Back</button>
        </router-link>

        <button class="generic-button-dark less-wide" v-on:click="editDetails">Edit Details</button>
        <button class="generic-button-dark less-wide" v-on:click="editOptions">Edit Options</button>
        <button class="generic-button-dark less-wide" v-on:click="editDates">Edit Dates</button>
        <button class="generic-button-dark less-wide" v-on:click="editMessages">Edit Messages</button>

      </div>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'
import AuthService from '../AuthService'
import LoggingService from '../LoggingService'
import moment from 'moment'
import PropertyDisplayList from "@/components/PropertyDisplayList";
import Swal from 'sweetalert2'

export default {
  name: "EventAdminView",
  components: {PropertyDisplayList},
  data() {
    return {
      user: Session.getUser(),
      loading: true,
      loadingError: "",
      returnPath: "/organizer/events",
      eventID: "",
      eventObj: {}
    }
  },
  beforeMount() {
    if (this.$route.query["returnPath"]) {
      this.returnPath = this.$route.query["returnPath"]
    }
    this.eventID = this.$route.query["eventID"];
    ApiService.getEventByID(this.eventID, (err, data) => {
      this.loading = false;
      if (err || !data) {
        this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
      } else {
        this.eventObj = data;
      }
    });
  },
  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    },
    editDetails() {
      Swal.fire({
        title: 'Enter Your Changes',
        html:
            `<input id="event-name" class="form-control" placeholder="Name" value="${this.eventObj.name}">` +
            `<br><textarea id="event-description" class="form-control" placeholder="Description">${this.eventObj.description}</textarea>`,
        showCancelButton: true,
        cancelButtonColor: '#d33',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('event-name').value, document.getElementById('event-description').value];
        }
      }).then((info) => {
        if(info.value){
          const newName = info.value[0].trim();
          const newDescription = info.value[1].trim();

          if(newName === "" || newDescription === ""){
            return Swal.fire({
              title: "Error",
              text: "The event name and description cannot be blank!",
              type: "error"
            });
          }

          AuthService.skillTest(() => {
            ApiService.updateEventDetails(this.eventID, newName, newDescription, (err, data) => {
              if(err){
                Swal.fire({
                  title: 'Error',
                  type: 'error',
                  text: 'There was an error updating event details.'
                });
                return;
              }
              Swal.fire({
                title: 'Success',
                text: `Successfully updated event details.`,
                type: 'success'
              }).then(()=>{
                this.$router.go();
              })
            })
          })
        }

      })
    },
    buildEditForm(editObj, textarea = false, replaceDates = false){
      const inputTemplate = textarea ? `<label for="eventEdit-{{fieldID}}" class="text-left float-left">{{fieldID}}</label>
      <textarea type="text" class="form-control" id="eventEdit-{{fieldID}}">{{fieldValue}}</textarea><br>` : `<label for="eventEdit-{{fieldID}}" class="text-left float-left">{{fieldID}}</label>
      <input type="text" class="form-control" id="eventEdit-{{fieldID}}" value="{{fieldValue}}"><br>`;

      let rForm = "";

      for(const field of Object.keys(editObj)) {
        rForm += inputTemplate.replaceAll("{{fieldID}}", field).replaceAll("{{fieldValue}}", replaceDates && editObj[field] != -1 ? moment(editObj[field]).format('YYYY-MM-DDTHH:mm:ss') : editObj[field]);
      }
      return rForm;
    },
    editOptions(){
      Swal.fire({
        title: 'Enter your changes',
        html: this.buildEditForm(this.eventObj.options),
        showCancelButton: true,
        cancelButtonColor: '#d33',
        focusConfirm: false,
        preConfirm: () => {
          let rVals = {};
          for(const field of Object.keys(this.eventObj.options)){
            rVals[field] = document.getElementById('eventEdit-'+field).value;
          }
          return rVals;
        }
      }).then((info) => {
        if(info.value){
          AuthService.skillTest(() => {
            ApiService.updateEventOptions(this.eventID, info.value, (err, data) => {
              if(err){
                Swal.fire({
                  title: 'Error',
                  type: 'error',
                  text: 'There was an error updating event options.'+ApiService.extractErrorText(err)
                });
                return;
              }
              Swal.fire({
                title: 'Success',
                text: `Successfully updated event options.`,
                type: 'success'
              }).then(()=>{
                this.$router.go();
              })
            })
          })
        }
      })
    },
    editDates() {
      Swal.fire({
        title: 'Enter your changes',
        html: this.buildEditForm(this.eventObj.dates, false, true),
        showCancelButton: true,
        cancelButtonColor: '#d33',
        focusConfirm: false,
        preConfirm: () => {
          let rVals = {};
          for(const field of Object.keys(this.eventObj.dates)){
            const fVal = document.getElementById('eventEdit-'+field).value;
            rVals[field] = fVal === "-1" ? fVal : moment(fVal).unix() * 1000;
          }
          return rVals;
        }
      }).then((info) => {
        if(info.value){
          AuthService.skillTest(() => {
            ApiService.updateEventDates(this.eventID, info.value, (err, data) => {
              if(err){
                Swal.fire({
                  title: 'Error',
                  type: 'error',
                  text: 'There was an error updating event dates.'+ApiService.extractErrorText(err)
                });
                return;
              }
              Swal.fire({
                title: 'Success',
                text: `Successfully updated event dates.`,
                type: 'success'
              }).then(()=>{
                this.$router.go();
              })
            })
          })
        }
      })
    },
    editMessages() {
      Swal.fire({
        title: 'Enter your changes',
        html: this.buildEditForm(this.eventObj.messages, true),
        showCancelButton: true,
        cancelButtonColor: '#d33',
        focusConfirm: false,
        preConfirm: () => {
          let rVals = {};
          for(const field of Object.keys(this.eventObj.messages)){
            rVals[field] = document.getElementById('eventEdit-'+field).value;
          }
          return rVals;
        }
      }).then((info) => {
        if(info.value){
          AuthService.skillTest(() => {
            ApiService.updateEventMessages(this.eventID, info.value, (err, data) => {
              if(err){
                Swal.fire({
                  title: 'Error',
                  type: 'error',
                  text: 'There was an error updating event messages.'+ApiService.extractErrorText(err)
                });
                return;
              }
              Swal.fire({
                title: 'Success',
                text: `Successfully updated event messages.`,
                type: 'success'
              }).then(()=>{
                this.$router.go();
              })
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>