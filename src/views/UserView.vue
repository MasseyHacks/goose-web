<template>
    <div style="width: 100%">
        <div class="organizer-card">
            <div class="ui-card dash-card-large">
                <h3 v-if="userObj.fullName">{{userObj.fullName.toUpperCase()}}</h3>

                <!--
                <div class="duo-col" id="detailed-info">
                    <ul style="list-style: none">
                        <li style="overflow-wrap: break-word; text-align: left;"
                            v-for="(value, key) in flatten(userObj,false)">
                            <span v-if="key !== 'Application'">

                                <b>{{Object.keys(fields).indexOf(key) != -1 ? fields[key]['caption']
                                : key}}</b><br>{{value !== null ? value : "[null]"}}<br>

                            </span>
                        </li>
                    </ul>
                </div>-->

                <json-tree :raw="JSON.stringify(formatUser(this.userObj))" :level="1" v-if="this.userLoadFormatComplete"></json-tree>


                <hr>

                <h4>APPLICATION</h4>
                <div class="duo-col">
                    <ul style="overflow-wrap: break-word; text-align: left; list-style: none">
                        <li v-for="(value, key) in userApp">
                            <br>
                            <b v-html="Object.keys(applications.hacker).indexOf(key) != -1 ? applications.hacker[key].reviewerText ? applications.hacker[key]['reviewerText'] : applications.hacker[key]['question']
                                : key"></b><br>{{value !== null ? value : "[Question left blank]"}}<br>
                        </li>
                    </ul>
                </div>

                <hr>

                <h4>STANDINGS</h4>
              <div class="duo-col">
                <ul style="overflow-wrap: break-word; text-align: left; list-style: none">
                  <li>
                    <br>
                    <b>Total Points</b><br>{{userObj.points ? userObj.points.total : ""}}<br>
                  </li>
                </ul>
              </div>

                <hr>

                <router-link :to="{path: returnPath}">
                    <button class="generic-button-dark less-wide">Back</button>
                </router-link>

                <button class="generic-button-dark less-wide" v-on:click="voteAdmit">Vote Admit</button>
                <button class="generic-button-dark less-wide" v-on:click="voteReject">Vote Reject</button>
                <button class="generic-button-dark less-wide" v-on:click="awardPoints">Award Points</button>

                <div v-if="user.permissions.owner">
                    <hr>

                    <button class="generic-button-dark less-wide" v-on:click="editUser">Edit User</button>
                    <button class="generic-button-dark less-wide" v-on:click="forceAdmit">Force Admit</button>
                    <button class="generic-button-dark less-wide" v-on:click="forceReject">Force Reject</button>
                    <button class="generic-button-dark less-wide" v-on:click="toggleStatus"><span v-if="userObj.status && userObj.status.statusReleased">Hide Status</span><span v-else>Release Status</span></button>

                    <hr>

                    <button class="generic-button-dark less-wide" v-on:click="unlockApplication">Unlock Application</button>
                    <button class="generic-button-dark less-wide" v-on:click="resetAdmissionState">Reset Admit</button>
                    <button class="generic-button-dark less-wide" v-on:click="resetInvitation">Reset Invitation</button>
                    <button class="generic-button-dark less-wide" v-on:click="resetVotes">Reset Votes</button>

                    <hr>

                    <button class="generic-button-dark less-wide" @click="requestSuperToken" v-if="user.permissions.developer">SU Login
                    </button>
                    <button class="generic-button-dark less-wide" v-on:click="changePassword">Change Password</button>
                    <button class="generic-button-dark less-wide" v-on:click="toggleSuspend"><span v-if="userObj.status && userObj.status.active">Deactivate</span><span v-else>Activate</span></button>

                    <button class="generic-button-dark less-wide" v-on:click="flushEmailQueue">Flush Email Queue</button>
                    <button class="generic-button-dark less-wide" v-on:click="deleteUser">Delete User</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">
    import Session from '../Session'
    import AuthService from '../AuthService'
    import Swal from 'sweetalert2'
    import ApiService from '../ApiService'
    import LoggingService from '../LoggingService'
    import moment from 'moment'
    import JsonTree from 'vue-json-tree'
    import {apiHost} from "../variables";

    export default {
      name: 'UserView',
        components: {
            JsonTree
        },
        data() {
            return {
                user: Session.getUser(),
                error: '',
                userID: '',
                userObj: {},
                userApp: {},
                returnPath: "/organizer/users",
                applications: {},
                fields: {},
                userLoadFormatComplete: false
            }
        },

        beforeMount() {
          if (this.$route.query["returnPath"]) {
              this.returnPath = this.$route.query["returnPath"]
          }

          this.userID = this.$route.query["username"];

            ApiService.getFields(true, (err, data) => {
                if (err || !data) {
                    this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err);
                } else {
                    this.fields = data;

                    ApiService.getApplications((err, applications) => {
                      this.applications = applications;

                    });

                    ApiService.getUser(this.userID, (err, data) => {
                      if (err || !data) {
                        Swal.fire("Error", "Error retrieving user information."+ApiService.extractErrorText(err), 'error');
                      } else {
                        this.userObj = data;
                        this.flatten(this.userObj,false);
                        this.userLoadFormatComplete = true;
                      }
                    });

                }
            });

        },

        mounted() {

        },

        methods: {
            awardPoints() {
              Swal.fire({
                title: 'Enter Points Information',
                html:
                    `<p>You are awarding points to: ${this.userObj.fullName}</p>` +
                    '<input id="award-amount" class="form-control" placeholder="Amount">' +
                    '<br><textarea id="award-notes" class="form-control" placeholder="Notes">',
                showCancelButton: true,
                cancelButtonColor: '#dd3333',
                focusConfirm: false,
                preConfirm: () => {
                  return [document.getElementById('award-amount').value, document.getElementById('award-notes').value];
                }
              }).then((info) => {
                if(info.value){
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
                  ApiService.awardUserPoints(this.userID, awardAmount, awardNotes, (err, data) => {
                    if(err){
                      return Swal.fire({
                        title: 'Error',
                        type: 'error',
                        text: 'There was an error awarding points.'+ApiService.extractErrorText(err)
                      });
                    }
                    Swal.fire({
                      title: 'Success',
                      text: `Successfully awarded ${awardAmount} points to ${this.userObj.fullName}.`,
                      type: 'success'
                    })
                  })
                }

              })
            },
            formatUser(user) {

                user = JSON.parse(JSON.stringify(user));

                for (var key of Object.keys(this.fields)) { // Replace unix timestamps with human readable

                    if (this.fields[key] && this.fields[key].time) {
                        key = key.split('.')
                        var runner = user;

                        for (var subkey in key) {

                            if (subkey == key.length - 1) {
                                runner[key[subkey]] = runner[key[subkey]] ? this.moment(runner[key[subkey]]) : 'N/A'
                            } else {
                                runner = runner[key[subkey]]
                            }
                        }
                    }
                }

                return user;
            },
            moment (date) {
                return moment(date).format('MMMM Do YYYY [at] h:mm:ss a')
            },
            changePassword: function() {

                AuthService.adminChangePassword(this.userObj.fullName, this.userID, () => {
                    Swal.fire('Success!', 'Successfully changed password', 'success');
                });

            },
            toggleSuspend: function() {

                if (this.userObj.status.active) {
                    ApiService.deactivate(this.userObj.fullName, this.userID, (data) => {
                        this.userObj = data;
                        Swal.fire('Success!', 'Successfully deactivated user', 'success');
                    });
                } else {
                    ApiService.activate(this.userObj.fullName, this.userID, (data) => {
                        this.userObj = data;
                        Swal.fire('Success!', 'Successfully activated user', 'success');
                    });
                }

            },
            toggleStatus: function() {

                if (this.userObj.status.statusReleased) {
                    ApiService.hideStatus(this.userObj.fullName, this.userID, (data) => {
                        this.userObj = data;
                        Swal.fire('Success!', 'Successfully hid status for user', 'success');
                    });
                } else {
                    ApiService.releaseStatus(this.userObj.fullName, this.userID, (data) => {
                        this.userObj = data;
                        Swal.fire('Success!', 'Successfully released status for user', 'success');
                    });
                }

            },
            deleteUser: function () {
                ApiService.deleteUser(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully deleted user', 'success').then(function () {
                        window.location.href = this.returnPath;
                    });

                });
            },
            flushEmailQueue: function () {
                ApiService.flushEmailQueue(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully flushed email queue', 'success');
                });
            },
            resetVotes: function () {
                ApiService.resetVotes(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully reset votes', 'success');
                });
            },
            resetInvitation: function () {
                ApiService.resetInvitation(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully reset invitation status', 'success');
                });
            },
            resetAdmissionState: function () {
                ApiService.resetAdmissionState(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully reset admission state', 'success');
                });
            },
            forceAdmit: function () {
                ApiService.forceAdmit(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully force admitted user', 'success');
                });
            },
            forceReject: function () {
                ApiService.forceReject(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully force rejected user', 'success');
                });
            },
            voteAdmit: function () {
                ApiService.voteAdmit(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully voted to admit user', 'success');
                });
            },
            voteReject: function () {
                ApiService.voteReject(this.userObj.fullName, this.userID, (data) => {
                    this.userObj = data;
                    Swal.fire('Success!', 'Successfully voted to reject user', 'success');
                });
            },
            flatten: function (obj, includeApplication = true, depth = 0) {
              LoggingService.debug("flattening user")
                var flattened = {};
                if (depth < 6) {
                    for (var keys in obj) {
                        if (typeof obj[keys] !== "object") {
                            if (!(keys === "QRCode" || keys === "authSecret" || keys === "_id")) {
                                flattened[keys] = obj[keys]
                            }
                        } else {
                            if (keys !== "profile") {
                                for (var depthKey in obj[keys]) {
                                    flattened[depthKey] = obj[keys][depthKey]
                                }
                            } else {
                                if (depth < 6) {
                                    var profileObj = this.flatten(obj[keys], includeApplication, depth + 1);
                                    LoggingService.debug("RECURSION: " + depth);
                                    if (includeApplication) {
                                        flattened["Application"] = profileObj
                                    }
                                    this.userApp = profileObj
                                }
                            }
                        }
                    }
                } else {
                    LoggingService.log("RECUR LIM REACHED")
                }
                return flattened
            },
            requestSuperToken: function () {
                AuthService.skillTest(() => {
                    ApiService.requestSuperToken({
                        id: this.userID
                    }, (err, data) => {
                        if (err) {
                            Swal.fire("Error", "This action has been logged."+ApiService.extractErrorText(err), "error")
                        } else {
                            Swal.fire({
                                title: "PEI TOKEN ISSUED!",
                                html: "<a href=\"" + data.url + "\">" + data.url + "</a>",
                                type: "success"
                            })
                        }
                    })
                })
            },
            unlockApplication: function() {
                AuthService.skillTest(() => {
                    ApiService.modifyUser({
                        userID: this.userObj._id,
                        data: {"profile.signature": "-1"}
                    }, (err, data) => {
                        if (err) {
                            Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                        } else {
                            Swal.fire('Success', 'Application has been unlocked.', 'success').then((result) => {
                                ApiService.getUser(this.userID, (err, data) => {
                                    if (err || !data) {
                                        Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                                    } else {
                                        this.userObj = data
                                    }
                                })
                            });

                        }
                    })
                });

            },
            editUser: function () {
                var flatWithHistory = this.flattenWithHistory(this.userObj);
                var keys = flatWithHistory.documentKeys;
                //remove values that cannot/should not be edited
                keys.splice(keys.indexOf('__v'), 1);
                keys.splice(keys.indexOf('_id'), 1);
                keys.splice(keys.indexOf('lowerCaseName'), 1);
                keys.splice(keys.indexOf('fullName'), 1);
                keys.splice(keys.indexOf('permissions.level'), 1);
                keys.splice(keys.indexOf('status.name'), 1);
                keys.splice(keys.indexOf('profile.isSigned'), 1);
                keys.splice(keys.indexOf('lowerCaseName'), 1);
                LoggingService.debug("user keys", keys);

                Swal.fire({
                    title: 'Warning',
                    type: 'warning',
                    text: 'Updating a user should be done through the appropriate function. This editor will not check for any errors or update any dependent fields. Continue?',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then(async (result) => {
                    if (result.value) {
                        const {value: field} = await Swal.fire({
                            title: 'Select a field',
                            input: 'select',
                            inputOptions: keys,
                            inputPlaceholder: 'Select a field',
                            showCancelButton: true,
                            inputValidator: (value) => {
                                return new Promise((resolve) => {
                                    resolve();
                                })
                            }
                        });

                        if (field) {
                            const {value: newValue} = await Swal.fire({
                                title: 'Enter a value for ' + keys[field],
                                input: 'text',
                                inputValue: flatWithHistory[keys[field]],
                                showCancelButton: true/*,
                                inputValidator: (value) => {
                                    return !value && 'You need to write something!'
                                }*/
                            });

                            Swal.fire({
                                title: 'Are you sure?',
                                type: 'warning',
                                html: `You are directly modifying ${this.userObj.fullName}!<br>` +
                                    '<br>Changes will be pushed <span style="color:red; font-weight:bold;">IMMEDIATELY</span>' +
                                    '<br>There is <span style="color:red; font-weight:bold;">NO</span> value validation' +
                                    `<br><br>Field: ${keys[field]}` +
                                    `<br><span style="font-weight:bold;">Old</span> value: ${flatWithHistory[keys[field]]}` +
                                    `<br><span style="font-weight:bold;">New</span> value: ${newValue}`,
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes!'
                            }).then((result) => {
                                if (result.value) {
                                    AuthService.skillTest(() => {
                                        Swal.showLoading();

                                        var postData = {};
                                        postData[keys[field]] = newValue;

                                        ApiService.modifyUser({
                                            userID: this.userObj._id,
                                            data: postData
                                        }, (err, data) => {
                                            if (err) {
                                                Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                                            } else {
                                                Swal.fire('Success', 'Field has been changed', 'success').then((result) => {
                                                    ApiService.getUser(this.userID, (err, data) => {
                                                        if (err || !data) {
                                                            Swal.fire('error', ApiService.extractErrorText(err), 'error');
                                                        } else {
                                                            this.userObj = data
                                                        }
                                                    })
                                                });

                                            }
                                        })
                                    })
                                }
                            })

                        }
                    }
                })
            },
            flattenWithHistory: function (data, prefix = "", level = 0) {
                var tempObj = {};
                if (level < 7) {
                    Object.keys(data).forEach((key) => {
                        if (data[key] === Object(data[key])) {
                            //iterate again!
                            tempObj = Object.assign(tempObj, this.flattenWithHistory(data[key], prefix + key + ".", level += 1));
                        } else {
                            //log the value
                            tempObj[prefix + key] = data[key];
                        }
                    });
                    if (prefix === "") {
                        tempObj["documentKeys"] = Object.keys(tempObj);
                    }
                    return tempObj;
                } else {
                    LoggingService.log("recursion limit reached!");
                    return {};
                }
            },

            prettify: function (str) {
                return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
                    return str.toUpperCase();
                })
            }
        }

    }
</script>