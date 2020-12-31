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

        <h4>TIMES</h4>
        <PropertyDisplayList :display-object="eventObj.dates" neg-one-replacement="Never" parse-as-dates="true"></PropertyDisplayList>

        <hr>


        <h4>MESSAGES</h4>
        <PropertyDisplayList :display-object="eventObj.messages"></PropertyDisplayList>

        <hr>

        <router-link :to="{path: returnPath}">
          <button class="generic-button-dark less-wide">Back</button>
        </router-link>

        <button class="generic-button-dark less-wide" v-on:click="v">Vote Admit</button>

        <div v-if="user.permissions.owner">
          <hr>

          <button class="generic-button-dark less-wide" v-on:click="">Edit User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'
import moment from 'moment'
import PropertyDisplayList from "@/components/PropertyDisplayList";

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
        this.loadingError = err ? err.rawError.error : 'Unable to process request'
      } else {
        this.eventObj = data;
      }
    });
  },
  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    }
  }
}
</script>

<style scoped>

</style>