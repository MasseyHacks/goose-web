<template>
    <div class="app-screen">
        <div class="container">
            <div class="row">
                <div class="title-card col-md-12">
                    <h2>OWNER</h2>
                </div>
            </div>
            <div style="padding-bottom: 30px">
                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Application Dates</h3>
                    <hr>

                    <h6>Registration Open: {{moment(settings.timeOpen)}}</h6>
                    <input class="form-control" type="datetime-local" v-model="timeOpen"/><br><br>


                    <h6>Registration Close: {{moment(settings.timeClose)}}</h6>
                    <input class="form-control" type="datetime-local" v-model="timeClose"/><br><br>

                        <h6>Confirmation Deadline: {{moment(settings.timeConfirm)}}</h6>
                    <input class="form-control" type="datetime-local" v-model="timeConfirm"/><br><br>


                    <button class="generic-button-dark less-wide" @click="changeTimes">Update time</button>
                </div>

                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Participant Limit</h3>
                    <hr>
                    <p>
                        <input type="number" class="form-control" v-model="maxParticipants" style="margin-bottom: 10px;">
                        <br>
                        <button class="generic-button-dark less-wide" @click="changeLimit">Update Participant Limit</button>
                    </p>
                </div>

                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Review Pending Schools</h3>
                    <hr>

                    {{pendingSchools.length ? pendingSchools.length : 'No'}} schools pending review

                    <br>
                    <button class="generic-button-dark less-wide" v-on:click="reviewSchools" :disabled="!pendingSchools.length">Review</button>
                </div>

                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Global User Management</h3>
                    <hr>

                    <button class="generic-button-dark less-wide" v-on:click="releaseAll">Release all status</button>
                    <button class="generic-button-dark less-wide" v-on:click="releaseAccepted">Release all accepted</button>
                    <button class="generic-button-dark less-wide" v-on:click="releaseWaitlisted">Release all waitlisted</button>
                    <button class="generic-button-dark less-wide" v-on:click="releaseRejected">Release all rejected</button>
                    <button class="generic-button-dark less-wide" v-on:click="queueLagger">Queue lagger emails</button>

                    <hr>

                    <button class="generic-button-dark less-wide" v-on:click="checkAllTeams">Check all teams admit</button>
                    <button class="generic-button-dark less-wide" v-on:click="pushBackRejected">Push Back Rejected</button>
                    <button class="generic-button-dark less-wide" v-on:click="rejectNoState">Reject no state</button>
                    <button class="generic-button-dark less-wide" v-on:click="hideAll">Hide all status</button>
                    <button class="generic-button-dark less-wide" v-on:click="flushAllEmails">Flush global email queue</button>
					
                </div>

                <div class="ui-card dash-card-offset dash-card dash-card-large">
                  <h3>Global Team Management</h3>
                  <hr>

                  <button class="generic-button-dark less-wide" v-on:click="deactivateAllTeams">Deactivate all teams</button>

                </div>
				
				<div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Email Queue Stats</h3>
                    <hr>
					<h6 v-for="(queue, name) in emailQueueStats">
						<span v-if="name != 'total'">
							{{name}}, size {{queue.size}}, last flush: 
								{{moment(queue.lastFlushed)}}
						</span>
						<span v-else>{{name}}, size {{queue}}</span>
					
					</h6>
					
                </div>


                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Raw Global Data</h3>
                    <hr>
                    <json-tree :raw="JSON.stringify(globalSettings)" :level="1"></json-tree>
                </div>


                <div class="ui-card dash-card-offset dash-card dash-card-large">
                    <h3>Email Templates</h3>
                    <hr>
                    <select class="form-control" style="margin-bottom: 10px;" v-model="selected">
                        <option disabled value="">Select a template</option>
                        <option v-for="option in templateOptions.length">{{templateOptions[option-1]}}</option>
                    </select>

                    <br>

                    <button class="generic-button-dark less-wide" @click="getTemplate">Get Template</button>
                </div>

                <div class="ui-card" id="dash-card-offset dash-card dash-card-large" style="margin-bottom: 50px" :style="{display: emailHTML?'block':'none'}">
                    <h3>Email Preview</h3>
                    <hr>
                    <div v-html="previewHTML" style="height: 50vh; overflow: auto;"></div>
                </div>

                <div class="ui-card" style="height: auto" :style="{display: emailHTML?'block':'none'}">
                    <h3>Email Editor</h3>
                    <hr>
                    <div id="email-editor">
                    </div>

                    <button class="generic-button-dark less-wide" @click="saveTemplate">Save</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AuthService from '../AuthService'
    import ApiService from '../ApiService'
    import LoggingService from '../LoggingService'
    import Session from '../Session'
    import moment from 'moment'
    import Swal from 'sweetalert2'

    import hljs from 'highlight.js'
    import 'highlight.js/styles/monokai-sublime.css'
    import 'quill/dist/quill.snow.css'
    import Quill from 'quill'
    import JsonTree from 'vue-json-tree'
    import {apiHost} from "../variables";

    export default {
      name: 'Owner',
        components: {
            JsonTree
        },
        data() {
            return {
                timeOpen: 0,
                timeClose: 0,
                timeConfirm: 0,
                settings: 0,
                editor: null,
                emailHTML: '',
                previewHTML: '',
                baseHTMLFront: '',
                baseHTMLBack: '',
                globalSettings: '',
                maxParticipants: 0,
                templateOptions: [],
                selected: '',
                pendingSchools: [],
				emailQueueStats: null,
				queuesWithLastFlush: []
            }
        },
        beforeMount() {
            this.convertTimes();


            ApiService.getPendingSchools((err, data) => {
                if (err) {
                    Swal.fire('Error', ApiService.extractErrorText(err, false), 'error')
                } else {
                    this.pendingSchools = data
                }
            });

            AuthService.sendRequest('GET', apiHost + '/api/email/listTemplates', null, (err, data) => {
                if (err) {
                  Swal.fire('error', "Error getting template." + ApiService.extractErrorText(err), 'error');
                } else {
                    this.templateOptions = data.validTemplates
                }
            });

            AuthService.sendRequest('GET', apiHost + '/api/getRawSettings', null, (err, data) => {
                this.globalSettings = data;

            });

			AuthService.sendRequest('GET', apiHost + '/api/getEmailQueueStats', null, (err, data) => {
				this.emailQueueStats = data.stats;
				
			});

            AuthService.sendRequest('GET', apiHost + '/api/email/get/base', null, (err, data) => {
                if (err) {
                    Swal.fire('Error', ApiService.extractErrorText(err, false), 'error')
                } else {
                    let base = data.email.split('{{emailData}}');
                    this.baseHTMLFront = base[0];
                    this.baseHTMLBack = base[1]
                }
            })
        },
        mounted() {
            this.editor = new Quill('#email-editor', {
                modules: {
                    syntax: {
                        highlight: text => hljs.highlightAuto(text).value
                    },
                    toolbar: [
                        ['clean', 'code-block']
                    ]
                },
                theme: 'snow'
            });

            this.editor.on('text-change', (delta, oldDelta, source) => {
                this.emailHTML = this.editor.getText();
                this.generatePreview()
            })

        },
        methods: {
            async reviewSchools() {
                while (this.pendingSchools.length) {
                    const {value: decision} = await Swal.fire({
                        title: 'Review School',
                        html: `If approved, it will be immediately added to the school database.<br><br>School Name: ${this.pendingSchools[0]}`,
                        input: 'radio',
                        inputOptions: ['Accept', 'Reject', 'Skip'],
                        inputValidator: (value) => {
                            return !value && 'Please make a decision to proceed'
                        }
                    });

                    if (decision) {
                        switch (decision) {
                            case '0': // Accept
                                LoggingService.debug('Accepted');

                                ApiService.approveSchool(this.pendingSchools[0]);
                                this.pendingSchools.splice(0, 1);

                                if (!this.pendingSchools.length) {
                                    Swal.fire({
                                        title: 'Review complete!',
                                        type: 'success'
                                    })
                                }


                                break;

                            case '1': // Rejeccc
                                LoggingService.debug('Rejected');


                                ApiService.rejectSchool(this.pendingSchools[0]);
                                this.pendingSchools.splice(0, 1);

                                if (!this.pendingSchools.length) {
                                    Swal.fire({
                                        title: 'Review complete!',
                                        type: 'success'
                                    })
                                }


                                break;

                            case '2': // Skip

                                this.pendingSchools.splice(0, 1);
                                break
                        }
                    } else {
                        break
                    }
                }
            },
            checkAllTeams() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO RECHECK ADMISSION STATUS FOR ALL TEAMS!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/checkAllTeams', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully checked ${msg} teams!`, 'success');
                                }
                            })
                        })
                    }
                })
            },
            pushBackRejected() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO PUSH BACK (to unreviewed) FOR ALL REJECTED USERS!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/pushBackRejected', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully unrejected ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },
            rejectNoState() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO REJECT ALL USERS WITHOUT AN APPLICATION STATE! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/rejectNoState', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully rejected ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },
            releaseAll() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO RELEASE THE STATUS FOR ALL USERS REGARDLESS OF APPLICATION STATE! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/releaseAllStatus', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully released status for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },

            releaseAccepted() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO RELEASE THE STATUS FOR ALL ACCEPTED USERS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/releaseAllAccepted', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully released status for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },

            releaseWaitlisted() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO RELEASE THE STATUS FOR ALL WAITLISTED USERS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/releaseAllWaitlisted', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully released status for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },


            queueLagger() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO QUEUE LAGGER EMAILS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/queueLagger', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully queued lagger emails!`, 'success');
                                }
                            })
                        })
                    }
                })
            },


            releaseRejected() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO RELEASE THE STATUS FOR ALL REJECTED USERS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/releaseAllRejected', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully released status for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },

            hideAll() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO HIDE THE STATUS FOR ALL USERS REGARDLESS OF STATUS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/hideAllStatus', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully hid status for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },

            flushAllEmails() {
                Swal.fire({
                    title: 'Are you sure you?',
                    text: 'YOU ARE ABOUT TO FLUSH THE EMAIL QUEUE FOR ALL USERS REGARDLESS OF STATUS! ARE YOU SURE YOU WANT TO PROCEED?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/flushAllEmails', {

                            }, (err, msg) => {
                                if (err) {
                                    Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', `Successfully flushed email queue for ${msg} users!`, 'success');
                                }
                            })
                        })
                    }
                })
            },

            deactivateAllTeams() {
              Swal.fire({
                title: 'Are you sure you?',
                text: 'YOU ARE ABOUT TO DEACTIVATE ALL TEAMS THAT ARE CURRENTLY ACTIVE! ARE YOU SURE YOU WANT TO PROCEED?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes!'
              }).then((result) => {
                if (result.value) {
                  AuthService.skillTest(() => {
                    Swal.showLoading();
                    AuthService.sendRequest('POST', apiHost + '/api/deactivateAllTeams', {

                    }, (err, msg) => {
                      if (err) {
                        Swal.fire('Error', 'Something went wrong...' + ApiService.extractErrorText(err), 'error')
                      } else {
                        Swal.fire('Success', `Team deactivation queued. Check the logs for any errors.`, 'success');
                      }
                    })
                  })
                }
              })
            },

            convertTimes() {
                this.settings = Session.getSettings();
                this.timeOpen = moment(this.settings.timeOpen).format('YYYY-MM-DDTHH:mm:ss');
                this.timeClose = moment(this.settings.timeClose).format('YYYY-MM-DDTHH:mm:ss');
                this.timeConfirm = moment(this.settings.timeConfirm).format('YYYY-MM-DDTHH:mm:ss');
                this.maxParticipants = this.settings.maxParticipants
            },
            moment (date) {
                return moment(date).format('LLLL')
            },
            changeLimit() {
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'This edit could have devastating effects!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/updateParticipantLimit', {
                                'maxParticipants': this.maxParticipants
                            }, (err, setting) => {
                                if (err || !setting) {
                                    Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', 'Limit has been changed successfully', 'success');
                                    Session.setSettings(setting);
                                    this.convertTimes()
                                }
                            })
                        })
                    }
                })
            },
            changeTimes () {
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'This edit will affect all hackers!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', apiHost + '/api/updateRegistrationTime', {
                                timeOpen: moment(this.timeOpen).unix() * 1000,
                                timeClose: moment(this.timeClose).unix() * 1000,
                                timeConfirm: moment(this.timeConfirm).unix() * 1000
                            }, (err, setting) => {
                                if (err || !setting) {
                                    Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', 'Application times has been changed', 'success');
                                    Session.setSettings(setting);
                                    this.convertTimes()
                                }
                            })
                        })
                    }
                })
            },
            getTemplate () {
                if (this.selected == '') {
                    Swal.fire('Error', 'You must select an email first', 'error')
                } else {
                    Swal.fire('Fetching email...')
                    Swal.showLoading();

                    AuthService.sendRequest('GET', apiHost + '/api/email/get/' + this.selected, null, (err, data) => {
                        if (err) {
                            Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                        } else {
                            Swal.fire('Success', 'Your Preview and Editor has been updated', 'success');
                            this.emailHTML = data.email;
                            this.editor.setText(this.emailHTML);
                            this.editor.formatLine(0, this.editor.getLength(), { 'code-block': true });
                        }
                    })
                }
            },
            saveTemplate() {
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'This edit will affect the template permanently!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes!'
                }).then((result) => {
                    if (result.value) {
                        AuthService.skillTest(() => {
                            Swal.showLoading();
                            AuthService.sendRequest('POST', 'api/email/set/' + this.selected, {
                                templateHTML: this.emailHTML,
                                templateName: this.selected
                            }, (err, data) => {
                                if (err || !data) {
                                    Swal.fire('Error', ApiService.extractErrorText(err), 'error')
                                } else {
                                    Swal.fire('Success', 'Template set', 'success')
                                }
                            })
                        })
                    }
                })
            },
            generatePreview () {
                this.previewHTML = this.baseHTMLBack + this.emailHTML + this.baseHTMLFront
            }
        }
    }
</script>

<style>
    .ql-editor {
        height: 50vh !important;
        width: 50vw !important;
        overflow-y: auto !important;
        overflow-x: auto !important;
    }

    .ql-syntax {
        display: inline-block !important;
    }

    .ql-syntax span {
        display: inline-block !important;
        white-space: nowrap;
    }

</style>
