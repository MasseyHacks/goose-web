/* globals localStorage */

import AuthService from './AuthService'
import swal from 'sweetalert2'
import {apiHost} from "./variables";

export default {

    hideStatus(userName, userID, callback) {
        swal({
            title: "Hide status for user?",
            html: '<span style="color:#FF0000; font-weight:bold;">HIDE STATUS</span> for '+ userName +
            '? THEY WILL NOT BE ABLE TO SEE THEIR ADMISSION STATUS!',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, hide status',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {

                AuthService.skillTest(() => {
                    console.log(userOK);
                    if (userOK) {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/hideStatus', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });

                    }
                });
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    releaseStatus(userName, userID, callback) {
        swal({
            title: "Release status?",
            html: '<span style="color:#00FF00; font-weight:bold;">RELEASE STATUS</span> FOR '+ userName +
            '? THEY WILL SEE THEIR ADMISSION STATE!',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, release',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/releaseStatus', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },

    deactivate(userName, userID, callback) {
        swal({
            title: "Deactivate account?",
            html: '<span style="color:#FF0000; font-weight:bold;">DEACTIVATE</span> '+ userName +
            '\'s ACCOUNT?',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, deactivate',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {

                AuthService.skillTest(() => {
                    console.log(userOK);
                    if (userOK) {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/deactivate', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });

                    }
                });
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    activate(userName, userID, callback) {
        swal({
            title: "Activate account?",
            html: '<span style="color:#00FF00; font-weight:bold;">ACTIVATE</span> '+ userName +
            '\'s ACCOUNT?',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, activate',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/activate', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    deleteUser(userName, userID, callback) {
        swal({
            title: "DELETE USER?",
            html: 'ARE YOU SURE YOU WANT TO <span style="color:#FF0000; font-weight:bold;">DELETE</span> '+ userName +
            '??????<br>You LITERALLY <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, DELETE ACCOUNT',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/deleteUser', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    flushEmailQueue(userName, userID, callback) {
        swal({
            title: "Flush Email Queue?",
            html: 'ARE YOU SURE YOU WANT TO <span style="color:#FF0000; font-weight:bold;">FLUSH EMAIL QUEUE</span> '+ userName +
            '?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, flush queue',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/flushEmailQueue', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    resetVotes(userName, userID, callback) {
        swal({
            title: "Reset votes?",
            html: 'RESET <span style="color:#FF0000; font-weight:bold;">ALL VOTES</span> FOR '+ userName +
            '?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, reset votes',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/voteReset', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    resetInvitation(userName, userID, callback) {
        swal({
            title: "Reset invitation status?",
            html: 'RESET <span style="color:#FF0000; font-weight:bold;">INVITATION</span> FOR '+ userName +
            '?<br>This will rollback user to an unconfirmed state.<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, reset invitation status',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/resetInvitation', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    resetAdmissionState(userName, userID, callback) {
        swal({
            title: "Reset admission state?",
            html: 'RESET <span style="color:#FF0000; font-weight:bold;">ADMISSION STATE</span> FOR '+ userName +
            '?<br>This will rollback user to an unreviewed state.<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, reset admission state',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/resetAdmissionState', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },
    voteAdmit(userName, userID, callback) {
        swal({
            title: "Confirm Your Vote [ADMIT]",
            html: 'Vote to <span style="color:#00FF00; font-weight:bold;">ADMIT</span> this user?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, vote admit',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){
                    //register the vote
                    AuthService.sendRequest('POST',apiHost + '/api/voteAdmit',{
                        userID: userID
                    }, (err,data) =>{
                        if(err){
                            swal("Error","Unable to perform action","error");
                        }
                        else if(!err && data){
                            if (callback) callback(data);
                        }
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },

    voteReject(userName, userID, callback) {
        swal({
            title: "Confirm Your Vote [REJECT]",
            html: 'Vote to <span style="color:#d33; font-weight:bold;">REJECT</span> this user?<br>You <span style="color:#d33; font-weight:bold;">CANNOT</span> undo this decision.',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, vote reject',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){
                    //register the vote
                    AuthService.sendRequest('POST',apiHost + '/api/voteReject',{
                        userID: userID
                    }, (err,data) =>{
                        if(err){
                            swal("Error","Unable to perform action","error");
                        }
                        else if(!err && data){
                            if (callback) callback(data);
                        }
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },

    forceAdmit(userName, userID, callback) {
        swal({
            title: "Whoa, wait a minute!<br>[FORCE ACTION]",
            html: 'You are about to <span style="color:#d33; font-weight:bold;">FORCE</span> <span style="color:#00FF00; font-weight:bold;">ADMIT</span> ' + userName + '!',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, <span style="font-weight:bold;">FORCE</span> admit',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){
                    //register the vote
                    AuthService.skillTest(() => {
                        AuthService.sendRequest('POST', apiHost + '/api/forceAccept', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },

    forceReject(userName, userID, callback) {
        swal({
            title: "Whoa, wait a minute!<br>[FORCE ACTION]",
            html: 'You are about to <span style="color:#d33; font-weight:bold;">FORCE REJECT</span> ' + userName + '!',
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: 'Yes, <span style="font-weight:bold;">FORCE</span> reject',
            confirmButtonColor: '#d33',
            showCancelButton: true,
            focusCancel: true,
            showLoaderOnConfirm: true,
            preConfirm: (userOK) => {
                console.log(userOK);
                if(userOK){

                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/forceReject', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                swal("Error", "Unable to perform action", "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });
                }
            },
            allowOutsideClick: () => !swal.isLoading()
        })
    },

    createTeam(teamName, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/createTeam', {
            teamName: teamName
        }, callback)
    },

    joinTeam(teamCode, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/joinTeam', {
            teamCode: teamCode
        }, callback)
    },

    leaveTeam(callback) {
        AuthService.sendRequest('POST', apiHost + '/api/leaveTeam', {}, callback)
    },

    getTeam(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getTeam', {}, callback)
    },

    getTeamByCode(code, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getTeamByCode', {code: code}, callback)
    },

    deleteTeam(code, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/deleteTeam', {
            code: code
        }, callback)
    },

    removeFromTeam(id, code, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/removeFromTeam', {
            code: code,
            id: id
        }, callback)
    },

    acceptTeam(code, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/admitTeam', {
            code: code
        }, callback)
    },

    rejectTeam(code, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/rejectTeam', {
            code: code
        }, callback)
    },

    getApplications(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/applications', {}, callback)
    },

    getFields(userview, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/fields', {userview: userview}, callback)
    },

    getStatistics(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/stats', {}, callback)
    },

    refreshStatistics(callback) {
        AuthService.sendRequest('POST', apiHost + '/api/refreshStatistics', {}, callback)
    },

    getUsers(query, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/users', query, callback)
    },

    getUser(id, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/user/' + id, {}, callback)
    },

    getTeamFields(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/teams/fields', {}, callback)
    },

    getTeams(query, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/teams', query, callback)
    },

    getLog(query, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/systemLog', query, callback)
    },

    getPendingSchools(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/pendingSchools', {}, callback)
    },

    approveSchool(school, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/approveSchool', {
            school: school
        }, callback)
    },

    rejectSchool(school, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/rejectSchool', {
            school: school
        }, callback)
    }
};