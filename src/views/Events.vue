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
          <p>Do some cool things with points here</p>
        </div>
      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>All Events</h3>
          <hr>
          <div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import ApiService from '../ApiService';
import Session from '../Session';
import Swal from 'sweetalert2';
export default {
  name: "Events",
  data() {
    return {
      userObj: Session.getUser(),
      events: {}
    }
  },
  beforeMount() {
    ApiService.getFilteredEvents((err, data) => {
      if(err){
        return Swal.fire({
          title: 'Error',
          type: 'error',
          text: 'There was an error loading events.' + ApiService.extractErrorText(err)
        })
      }
      this.events = data;
    })
  },
  methods: {

  }
}
</script>

<style scoped>

</style>