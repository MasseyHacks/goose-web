<template>
  <div class="app-screen">
    <div class="container">
      <div class="row">
        <div class="title-card col-md-12">
          <h2>POINTS</h2>
          <h4>You currently have {{user.points.total}} points</h4>
        </div>
      </div>

      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Redeem Points</h3>

          <hr>
          <p>Do some cool things with points here</p>
        </div>

      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Points History</h3>
          <hr>
          <div v-for="pointEntry in reversePointEntries" style="margin:0.5em">
            <div class="collapsible" style="word-wrap: break-word">
              {{moment(parseInt( pointEntry._id.substring(0,8), 16 ) * 1000)}}<br>
              <b>{{pointEntry.amount >= 0 ? "+" : ""}}{{pointEntry.amount}} points</b><br>
              <span>{{pointEntry.notes}}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script>
import AuthService from '../AuthService'
import Swal from 'sweetalert2'
import moment from 'moment';
import Session from "../Session";

export default {
  data() {
    return {
      user: Session.getUser(),
      settings: Session.getSettings(),
    }
  },
  computed: {
    reversePointEntries() {
      return this.user.points.history.slice().reverse();
    }
  },
  methods: {
    moment (date) {
      return moment(date).format('MMMM Do YYYY [at] h:mm:ss a')
    },
  }
}
</script>

<style scoped>
.collapsible {
  background-color: #777;
  color: white;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}
.collapsible:hover {
  background-color: #555;
}

</style>
