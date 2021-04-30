<template>
  <div class="app-screen">
    <div class="container">
      <div class="row">
        <div class="title-card col-md-12">
          <h2>SUBMISSIONS</h2>
        </div>
      </div>

      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Submission Boxes</h3>

          <hr>
          <p v-if="submissionBoxesError">{{submissionBoxesError}}</p>
          <table class="data-table-generic" v-else>
            <tr class="table-header">
              <td>NAME</td>
              <td>DESCRIPTION</td>
              <td>CLOSES</td>
              <td>SUBMIT</td>
            </tr>
            <tr v-for="submissionBox in submissionBoxes" v-if="submissionBox.dates.open < Date.now() && submissionBox.dates.close > Date.now()">
              <td>
                {{submissionBox.name}}
              </td>
              <td>
                {{submissionBox.description}}
              </td>
              <td>
                {{moment(submissionBox.dates.close)}}
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="createSubmission(submissionBox._id)">Submit</button>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding-bottom: 30px">
          <div class="ui-card dash-card-offset dash-card dash-card-large">
            <h3>Submission History</h3>

            <hr>
            <p v-if="pastSubmissionsError">{{pastSubmissionsError}}</p>
            <table class="data-table-generic" v-else>
              <tr class="table-header">
                <td>ID</td>
                <td>SUBMIT DATE</td>
                <td>SUBMISSION BOX</td>
              </tr>
              <tr v-for="pastSubmission in pastSubmissions">
                <td>
                  {{pastSubmission._id}}
                </td>
                <td>
                  {{moment(pastSubmission.submitTime)}}
                </td>
                <td>
                  {{pastSubmission.submissionBoxName}}
                </td>
              </tr>
            </table>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import moment from 'moment';
import Session from "../Session";
import ApiService from "@/ApiService";

import {apiHost} from "../variables";

import axios from 'axios';

export default {
  name: 'Submissions',
  data() {
    return {
      user: Session.getUser(),
      settings: Session.getSettings(),
      submissionBoxes: [],
      submissionBoxesError: "",
      pastSubmissions: [],
      pastSubmissionsError: ""
    }
  },
  beforeMount() {
    ApiService.getSubmissionBoxes((err, data) => {
      if(err){
        this.submissionBoxesError = ApiService.extractErrorText(err);
      }
      else{
        this.submissionBoxes = data;
      }
    });

    ApiService.getPastSubmissions(this.user._id, (err, data) => {
      if(err){
        this.pastSubmissionsError = ApiService.extractErrorText(err);
      }
      else{
        this.pastSubmissions = data;
      }
    });
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
    createSubmission(submissionBoxID) {
      Swal.fire({
        title: 'Create submission',
        html:
            '<div class="text-left"><label for="submission-description">Write a short description about your submission:</label><textarea class="swal2-textarea" id="submission-description"></textarea>'+
            '<label for="submission-files">Attach your files (10 max): </label><input type="file" id="submission-files" multiple="multiple"></div>',
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById('submission-description').value,
            document.getElementById('submission-files').files
          ]
        }
      }).then((response) => {
        if(response.value){
          let values = response.value;

          if(values[1].length > 10){
            Swal.fire({
              type: 'error',
              title: 'Error',
              text: 'You have attached too many files. Please only select up to 10.'
            })
          }
          else if(values[0].trim() === ""){
            Swal.fire({
              type: 'error',
              title: 'Error',
              text: 'Please enter a description about your submission.'
            })
          }
          else{
            let formData = new FormData();
            formData.append('submissionBoxID', submissionBoxID);
            formData.append('description', values[0]);

            for(let file of values[1]){
              formData.append('files', file);
            }
            axios({
              method: 'post',
              url: apiHost + '/api/createSubmission',
              headers: {
                'x-access-token': Session.getToken(),
                'Content-Type': 'multipart/form-data'
              },
              data: formData
            }).then((res) => {
              Swal.fire({
                type: 'success',
                title: 'Success',
                text: `Submission with ID ${res.data._id} created.`
              }).then(() => {
                this.$router.go();
              })
            }).catch((err) => {
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: "Unable to create submission." + ApiService.extractErrorText(err)
              })
            })
          }
        }
      })
    }
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
