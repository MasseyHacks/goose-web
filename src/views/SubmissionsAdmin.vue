<template>
  <div style="width: 100%">
    <div class="organizer-card">
      <div class="ui-card dash-card-large">
        <div>
          <button class="generic-button-dark less-wide" @click="createSubmissionBox">Create New</button>
        </div>
        <hr>

        <p v-if="shopError">{{shopError}}</p>
        <div style="overflow-x: auto; max-width: 100%" v-else>
          <table class="data-table-generic">
            <tr class="table-header">
              <td>NAME</td>
              <td>DESCRIPTION</td>
              <td>SUBMISSIONS</td>
              <td>OPEN TIME</td>
              <td>CLOSE TIME</td>
              <td>AWARD POINTS</td>
              <td>EDIT</td>
            </tr>
            <tr v-for="(submissionBox, index) in submissionBoxes">
              <td>
                {{submissionBox.name}}
              </td>
              <td>
                {{submissionBox.description}}
              </td>
              <td>{{submissionBox.submissions.length}}</td>
              <td>
                {{submissionBox.dates.open === -1 ? "Never" : moment(submissionBox.dates.open)}}
              </td>
              <td>
                {{submissionBox.dates.close === -1 ? "Never" : moment(submissionBox.dates.close)}}
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="awardAllPoints(submissionBox._id)">Award Points</button>
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="editSubmissionBox(submissionBox._id, index)">Edit</button>
              </td>
            </tr>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Session from '../Session'
import Swal from 'sweetalert2'
import ApiService from '../ApiService'
import moment from "moment";

export default {
  name: 'SubmissionsAdmin',
  data() {
    return {
      user: Session.getUser(),
      shopError: "",
      submissionBoxes: []
    }
  },

  created() {
  },
  beforeMount() {
    ApiService.getSubmissionBoxes((err, boxes) => {
      this.submissionBoxes = boxes;
    })
  },
  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    },
    convertDateEditStringToDate(string){
      if(string === "-1"){
        return -1;
      }
      return moment(string).unix() * 1000
    },
    createSubmissionBox() {
      Swal.fire({
        title: 'Enter Submission Box Information',
        html: '<label for="submissionBoxEdit-name" class="text-left float-left">Name</label>' +
            '<input type="text" class="form-control" id="submissionBoxEdit-name" placeholder="Cool Item">' +

            '<label for="submissionBoxEdit-description" class="text-left float-left">Description</label>' +
            '<textarea type="text" class="form-control" id="submissionBoxEdit-description" placeholder="One of the coolest submission boxses in the galaxy."></textarea>' +
            
            '<label for="submissionBoxEdit-submissionsOpenTime" class="text-left float-left">Open Time</label>' +
            `<input type="text" class="form-control" id="submissionBoxEdit-submissionsOpenTime" value="${moment(0).format('YYYY-MM-DDTHH:mm:ssZ')}">` +

            '<label for="submissionBoxEdit-submissionsClose" class="text-left float-left">Close Time</label>' +
            `<input type="text" class="form-control" id="submissionBoxEdit-submissionsClose" value="${moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ')}">`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('submissionBoxEdit-name').value, document.getElementById('submissionBoxEdit-description').value,
            this.convertDateEditStringToDate(document.getElementById('submissionBoxEdit-submissionsOpenTime').value), this.convertDateEditStringToDate(document.getElementById('submissionBoxEdit-submissionsClose').value)];
        }
      }).then((info) => {
        if(info.value){
          let name = info.value[0];
          let description = info.value[1];
          let submissionsOpenTime = info.value[2];
          let submissionsClose = info.value[3];

          ApiService.createSubmissionBox(name, description, submissionsOpenTime, submissionsClose, (err, data) => {
            if(err){
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'There was an error creating the submission box.' + ApiService.extractErrorText(err)
              })
            }
            else {
              Swal.fire({
                type: 'success',
                title: 'Success',
                text: 'Submission box was successfully created! ID: ' + data._id
              }).then((result) =>{
                this.$router.go();
              })
            }
          })
        }
      })
    },
    editSubmissionBox(itemID, index){
      let submissionBoxInfo = this.submissionBoxes[index];

      Swal.fire({
        title: 'Enter Submission Box Information',
        html: '<label for="submissionBoxEdit-name" class="text-left float-left">Name</label>' +
            `<input type="text" class="form-control" id="submissionBoxEdit-name" value="${submissionBoxInfo.name}">` +

            '<label for="submissionBoxEdit-description" class="text-left float-left">Description</label>' +
            `<textarea type="text" class="form-control" id="submissionBoxEdit-description">${submissionBoxInfo.description}</textarea>` +

            '<label for="submissionBoxEdit-submissionssOpenTime" class="text-left float-left">submissionss Open</label>' +
            `<input type="text" class="form-control" id="submissionBoxEdit-submissionssOpenTime" value="${moment(submissionBoxInfo.dates.open).format('YYYY-MM-DDTHH:mm:ssZ')}">` +

            '<label for="submissionBoxEdit-submissionssClose" class="text-left float-left">submissionss Close</label>' +
            `<input type="text" class="form-control" id="submissionBoxEdit-submissionssClose" value="${submissionBoxInfo.dates.close === -1 ? -1 : moment(submissionBoxInfo.dates.close).format('YYYY-MM-DDTHH:mm:ssZ')}">`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('submissionBoxEdit-name').value, document.getElementById('submissionBoxEdit-description').value,
            this.convertDateEditStringToDate(document.getElementById('submissionBoxEdit-submissionssOpenTime').value), this.convertDateEditStringToDate(document.getElementById('submissionBoxEdit-submissionssClose').value)];
        }
      }).then((info) => {
        if(info.value){
          let name = info.value[0];
          let description = info.value[1];
          let submissionsOpenTime = info.value[2];
          let submissionsClose = info.value[3];

          ApiService.updateSubmissionBox(itemID, name, description, submissionsOpenTime, submissionsClose, (err, data) => {
            if(err){
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'There was an error editing the submission box.' + ApiService.extractErrorText(err)
              })
            }
            else {
              Swal.fire({
                type: 'success',
                title: 'Success',
                text: 'Submission box was successfully updated.'
              }).then((result) =>{
                this.$router.go();
              });
            }
          })
        }
      })
    },
    awardAllPoints(boxID) {
      Swal.fire({
        title: 'Enter Points Information',
        html:
            `<p>You are awarding points to all users of box ${boxID} </p>` +
            '<input id="award-amount" class="form-control" placeholder="Amount">' +
            '<br><textarea id="award-notes" class="form-control" placeholder="Notes">',
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('award-amount').value, document.getElementById('award-notes').value];
        }
      }).then((info) => {
        if (info.value) {
          let awardAmount = info.value[0].trim();
          let awardNotes = info.value[1].trim();

          if (awardAmount === "" || isNaN(awardAmount) || (awardAmount * 10) % 10 !== 0) {
            return Swal.fire({
              title: 'Error',
              type: 'error',
              text: 'Points award amount is not a whole number!'
            }).then(() => {
              this.awardPoints();
            });
          }
          if (awardNotes === "") {
            return Swal.fire({
              title: 'Error',
              type: 'error',
              text: 'Please enter a note about this point award!'
            }).then(() => {
              this.awardPoints();
            });
          }
          ApiService.awardSubmittedPoints(boxID, awardAmount, awardNotes, (err, data) => {
            if (err) {
              return Swal.fire({
                title: 'Error',
                type: 'error',
                text: 'There was an error awarding points.' + ApiService.extractErrorText(err)
              });
            }
            Swal.fire({
              title: 'Success',
              text: `Successfully awarded ${awardAmount} points to all users who have submitted to box ${boxID}.`,
              type: 'success'
            })
          })
        }

      })
    }
  }
}
</script>