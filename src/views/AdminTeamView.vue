<template>
    <div style="width: 100%">
        <div class="organizer-card">
            <div class="ui-card dash-card-large">
            <h3>Team Name: {{teamObj.name}}</h3>

            <div style="overflow-x: auto; max-width: 100%">
                <table class='data-table-generic'>
                    <tr class='table-header'>
                        <td>NAME</td>
                        <td>ADMISSION STATUS</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr v-for="member in teamObj.memberNames">
                        <td>{{member.name}}</td>
                        <td>{{status(member.status)}}</td>
                        <td>
                            <router-link :to="{path: '/organizer/userview?username='+member.id+'&returnPath=/organizer/teamview', params: {username: member.id}}">
                                <button class="generic-button-dark less-wide">View</button>
                            </router-link>
                        </td>
                        <td><button class="generic-button-dark less-wide" v-on:click="removeUser(member)">Remove</button></td>
                    </tr>
                </table>
            </div>

            <!--
            <div id="detailed-info" style="column-count: 2; column-width: 300px;">
                <ul style="list-style: none">
                    <li v-for="member in teamMembers" style="overflow-wrap: break-word; text-align: left;">
                        <router-link :to="{path: '/organizer/userview?username='+member.id+'&returnPath=/organizer/teamview', params: {username: member.id}}">
                            {{member.name}}
                        </router-link>
                        <i class="fa fa-times" style="color:red" v-on:click="removeUser(member)"></i>
                    </li>
                </ul>

            </div>-->
                <div>
                  <router-link :to="{path: returnPath}"><button class="generic-button-dark less-wide">Back</button></router-link>
                  <button class="generic-button-dark less-wide" v-on:click="awardPoints">Award Points</button>
                </div>
                <div v-if="user.permissions.owner">
                    <hr>
                    <button class="generic-button-dark less-wide" v-on:click="acceptTeam">Force Admit</button>
                    <button class="generic-button-dark less-wide" v-on:click="rejectTeam">Force Reject</button>

                    <button class="generic-button-dark less-wide" v-on:click="deactivateTeam" :disabled="!this.teamObj.active">Deactivate Team</button>
                    <button class="generic-button-dark less-wide" v-on:click="deleteTeam">Delete Team</button>

                </div>
        </div>
        </div>
    </div>
</template>

<script type="text/javascript">
    import Session from '../Session'
    import Swal from 'sweetalert2'
    import ApiService from '../ApiService'
    import LoggingService from '../LoggingService'

    export default {
      name: 'AdminTeamView',
        data() {
            return {
                user: Session.getUser(),
                error : '',
                teamCode: '',
                teamObj: [],
                teamMembers: [],
                returnPath: "/organizer/teamview",
            }
        },

        beforeMount() {
            if (this.$route.query["returnPath"]) {
                this.returnPath = this.$route.query["returnPath"]
            }

            this.teamCode = this.$route.query["code"];
            ApiService.getTeamByCode(this.teamCode, (err, data) => {
                if (err || !data) {
                  Swal.fire('error', "There was an error retrieving the team. " + ApiService.extractErrorText(err), 'error');
                } else {
                    this.teamObj = data;
                    this.teamMembers = data.memberNames;
                }
            })
        },

        mounted() {

        },

        methods: {
            status(rawStatus) {
                
                if (rawStatus.checkedIn) {
                    return 'checked in';
                }

                if (rawStatus.declined) {
                    return 'declined';
                }

                if (rawStatus.waitlisted) {
                    return 'waitlisted';
                }

                if (rawStatus.confirmed) {
                    return 'confirmed';
                }

                if (rawStatus.admitted) {
                    return 'admitted';
                }

                if (rawStatus.rejected) {
                    return 'rejected';
                }

                if (rawStatus.submittedApplication) {
                    return 'submitted';
                }

                return 'incomplete';

            },
            deactivateTeam() {
              Swal.fire({
                title: 'Warning',
                type: 'warning',
                text: 'Are you sure you want to deactivate ' + this.teamObj.name +'? It will need to be reactivated manually.',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes!'
              }).then((result) => {
                if (result.value) {
                  Swal.showLoading();

                  ApiService.deactivateTeam(this.teamObj._id, (err, data) => {
                    if (err) {
                      Swal.fire({
                        title: "Warning",
                        type: 'danger',
                        text: 'Unable to deactivate team.'+ApiService.extractErrorText(err)
                      })
                    } else {
                      Swal.fire({
                        title: "Success",
                        type: 'success',
                        text: 'Team has been deactivated.'
                      }).then(() => {
                        this.teamObj.active = false;
                      })
                    }
                  })
                }
              })
            },
            removeUser(user) {
                Swal.fire({
                    title: 'Warning',
                    type: 'warning',
                    text: 'This action is irreversible! Are you sure you want to delete ' + user.name +' from this team (If this is the last member, the team will be deleted as well)',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        Swal.showLoading();

                        ApiService.removeFromTeam(user.id, this.teamCode, (err, data) => {
                            if (err) {
                                Swal.fire({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to remove user.'+ApiService.extractErrorText(err)
                                })
                            } else {
                                Swal.fire({
                                    title: "Success",
                                    type: 'success',
                                    text: 'User has been removed.'
                                }).then(() => {
                                    if (data.message) {
                                        this.$router.push({path: this.returnPath});
                                    } else {
                                        for (let i = 0; i < this.teamMembers.length; i++) {
                                            if (this.teamMembers[i] === user) {
                                                this.$delete(this.teamMembers, i);
                                                break
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            },
            deleteTeam() {
                Swal.fire({
                    title: 'Warning',
                    type: 'warning',
                    text: 'This action is irreversible! Are you sure you want to delete this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        Swal.showLoading();

                        ApiService.deleteTeam(this.teamCode, (err, data) => {
                            if (err) {
                                Swal.fire({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to delete team.'+ApiService.extractErrorText(err)
                                })
                            } else {
                                Swal.fire({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been deleted'
                                }).then(() => {
                                    this.$router.push({path: this.returnPath});
                                })
                            }
                        })
                    }
                })
            },
            acceptTeam() {
                Swal.fire({
                    title: 'Warning',
                    type: 'warning',
                    text: 'Are you sure you want to admit this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        Swal.showLoading();

                        ApiService.acceptTeam(this.teamCode, (err, data) => {
                            if (err) {
                                Swal.fire({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to admit team'+ApiService.extractErrorText(err)
                                })
                            } else {
                                Swal.fire({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been admitted'
                                })
                            }
                        })
                    }
                })
            },
            rejectTeam() {
                Swal.fire({
                    title: 'Warning',
                    type: 'warning',
                    text: 'Are you sure you want to reject this team',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        Swal.showLoading();

                        ApiService.rejectTeam(this.teamCode, (err, data) => {
                            if (err) {
                                Swal.fire({
                                    title: "Warning",
                                    type: 'danger',
                                    text: 'Unable to reject team.'+ApiService.extractErrorText(err)
                                })
                            } else {
                                Swal.fire({
                                    title: "Success",
                                    type: 'success',
                                    text: 'Team has been rejected'
                                })
                            }
                        })
                    }
                })
            },
            awardPoints() {
                Swal.fire({
                  title: 'Enter Points Information',
                  html:
                      `<p>You are awarding points to: ${this.teamObj.name}</p>` +
                      '<input id="award-amount" class="form-control" placeholder="Amount">' +
                      '<br><textarea id="award-notes" class="form-control" placeholder="Notes">',
                  focusConfirm: false,
                  preConfirm: () => {
                    return [document.getElementById('award-amount').value, document.getElementById('award-notes').value];
                  }
                }).then((info) => {
                    let awardAmount = info.value[0].trim();
                    let awardNotes = info.value[1].trim();

                    if(awardAmount === "" || isNaN(awardAmount) || (awardAmount * 10)%10 !== 0){
                      return Swal.fire({
                        title: 'Error',
                        type: 'error',
                        text: 'Points award amount is not a whole number!'
                      }).then(() => {
                        this.awardPoints();
                      });
                    }
                    if(awardNotes === ""){
                      return Swal.fire({
                        title: 'Error',
                        type: 'error',
                        text: 'Please enter a note about this point award!'
                      }).then(() => {
                        this.awardPoints();
                      });
                    }
                    ApiService.awardTeamPoints(this.teamCode, awardAmount, awardNotes, (err, data) => {
                      if(err){
                        return Swal.fire({
                          title: 'Error',
                          type: 'error',
                          text: 'There was an error awarding points.' + ApiService.extractErrorText(err)
                        });
                      }
                      Swal.fire({
                        title: 'Success',
                        text: `Successfully awarded ${awardAmount} points to ${this.teamObj.name}.`,
                        type: 'success'
                      })
                    })
                })
              }

        }

    }
</script>
