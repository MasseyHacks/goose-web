/* globals localStorage */

import AuthService from './AuthService'
import LoggingService from './LoggingService'
import Swal from 'sweetalert2'
import {apiHost} from "./variables";

export default {
    extractErrorText(error, addSpace = true){
        if(error){
            if(error.rawError && error.rawError.error && error.rawError.error.response && error.rawError.error.response.data && error.rawError.error.response.data.clean){
                return (addSpace ? " ": "") + error.rawError.error.response.data.error;
            }
            if(error.rawError && error.rawError.error){
                return (addSpace ? " ": "") + error.rawError.error;
            }
        }
        return (addSpace ? " ": "") + "Unable to retrieve additional details about the error.";
    },
    hideStatus(userName, userID, callback) {
        Swal.fire({
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
                    if (userOK) {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/hideStatus', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });

                    }
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    releaseStatus(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/releaseStatus', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },

    deactivate(userName, userID, callback) {
        Swal.fire({
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
                    if (userOK) {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/deactivate', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });

                    }
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    activate(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/activate', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    deleteUser(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/deleteUser', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    flushEmailQueue(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/flushEmailQueue', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    resetVotes(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/voteReset', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    resetInvitation(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/resetInvitation', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    resetAdmissionState(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/resetAdmissionState', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },
    voteAdmit(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    //register the vote
                    AuthService.sendRequest('POST',apiHost + '/api/voteAdmit',{
                        userID: userID
                    }, (err,data) =>{
                        if(err){
                            Swal.fire("Error","Unable to perform action." + this.extractErrorText(err),"error");
                        }
                        else if(!err && data){
                            if (callback) callback(data);
                        }
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },

    voteReject(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    //register the vote
                    AuthService.sendRequest('POST',apiHost + '/api/voteReject',{
                        userID: userID
                    }, (err,data) =>{
                        if(err){
                            Swal.fire("Error","Unable to perform action." + this.extractErrorText(err),"error");
                        }
                        else if(!err && data){
                            if (callback) callback(data);
                        }
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },

    forceAdmit(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    //register the vote
                    AuthService.skillTest(() => {
                        AuthService.sendRequest('POST', apiHost + '/api/forceAccept', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });

                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    },

    forceReject(userName, userID, callback) {
        Swal.fire({
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
                if(userOK){
                    AuthService.skillTest(() => {
                        //register the vote
                        AuthService.sendRequest('POST', apiHost + '/api/forceReject', {
                            userID: userID
                        }, (err, data) => {
                            if (err) {
                                Swal.fire("Error", "Unable to perform action." + this.extractErrorText(err), "error");
                            }
                            else if (!err && data) {
                                if (callback) callback(data);
                            }
                        });
                    });
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
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

    deactivateTeam(code, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/deactivateTeam', {
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
        AuthService.sendRequest('POST', apiHost + '/api/users', query, callback)
    },

    getUser(id, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/user/' + id, {}, callback)
    },

    getTeamFields(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/teams/fields', {}, callback)
    },

    getTeams(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/teams', query, callback)
    },

    getLog(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/systemLog', query, callback)
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
    },
    checkOut(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/checkOut', query, callback)
    },
    checkIn(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/checkIn', query, callback)
    },
    waiverIn(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/waiverIn', query, callback)
    },
    updateProfile(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/updateProfile', query, callback)
    },
    acceptInvitation(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/acceptInvitation', query, callback)
    },
    declineInvitation(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/declineInvitation', query, callback)
    },
    modifyUser(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/modifyUser', query, callback)
    },
    requestSuperToken(query, callback) {
        AuthService.sendRequest('POST', apiHost + '/auth/requestSuperToken', query, callback)
    },
    awardTeamPoints(code, amount, notes, callback){
        AuthService.sendRequest('POST', apiHost + '/api/awardTeamPoints', {
            code: code,
            amount: amount,
            notes: notes
        }, callback);
    },
    awardUserPoints(id, amount, notes, callback){
        AuthService.sendRequest('POST', apiHost + '/api/awardUserPoints', {
            id: id,
            amount: amount,
            notes: notes
        }, callback);
    },
    getAllEvents(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getAllEvents', {}, callback);
    },
    getEventByID(id, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getEvent', {id: id}, callback);
    },
    getFilteredEvents(callback){
        AuthService.sendRequest('GET', apiHost + '/api/getFilteredEvents', {}, callback);
    },
    updateEventDetails(id, newName, newDescription, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateEventDetails', {
            id: id,
            newName: newName,
            newDescription: newDescription
        }, callback);
    },
    updateEventOptions(id, newOptions, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateEventOptions', {
            id: id,
            newOptions: newOptions
        }, callback);
    },
    updateEventDates(id, newDates, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateEventDates', {
            id: id,
            newDates: newDates
        }, callback);
    },
    updateEventMessages(id, newMessages, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateEventMessages', {
            id: id,
            newMessages: newMessages
        }, callback);
    },
    registerForEvent(userID, eventID, callback){
        AuthService.sendRequest('POST', apiHost + '/api/registerForEvent', {
            userID: userID,
            eventID: eventID
        }, callback);
    },
    unregisterFromEvent(userID, eventID, callback){
        AuthService.sendRequest('POST', apiHost + '/api/unregisterFromEvent', {
            userID: userID,
            eventID: eventID
        }, callback);
    },
    checkInEvent(userID, eventID, checkInCode, callback){
        AuthService.sendRequest('POST', apiHost + '/api/checkInToEvent', {
            userID: userID,
            eventID: eventID,
            checkInCode: checkInCode
        }, callback);
    },
    createEvent(eventName, eventDescription, eventDate, callback){
        AuthService.sendRequest('POST', apiHost + '/api/createEvent', {
            name: eventName,
            description: eventDescription,
            dateTime: eventDate
        }, callback);
    },
    getEventMessages(eventID, callback){
        AuthService.sendRequest('GET', apiHost + '/api/getEventMessages', {
            eventID: eventID,
        }, callback);
    },
    awardEventRegisteredPoints(eventID, amount, notes, callback){
        AuthService.sendRequest('POST', apiHost + '/api/awardEventRegisteredPoints', {
            id: eventID,
            amount: amount,
            notes: notes
        }, callback);
    },
    awardEventCheckedInPoints(eventID, amount, notes, callback){
        AuthService.sendRequest('POST', apiHost + '/api/awardEventCheckedInPoints', {
            id: eventID,
            amount: amount,
            notes: notes
        }, callback);
    },
    getEventRegisteredUsers(eventID, page, pageSize, callback){
        AuthService.sendRequest('GET', apiHost + '/api/getEventRegisteredUsers', {
            id: eventID,
            page: page,
            pageSize: pageSize
        }, callback);
    },
    getEventCheckedInUsers(eventID, page, pageSize, callback){
        AuthService.sendRequest('GET', apiHost + '/api/getEventCheckedInUsers', {
            id: eventID,
            page: page,
            pageSize: pageSize
        }, callback);
    },
    createShopItem(name, description, price, maxOrders, ordersOpenTime, ordersCloseTime, callback){
        AuthService.sendRequest('POST', apiHost + '/api/createShopItem', {
            name: name,
            description: description,
            price: price,
            maxOrders: maxOrders,
            ordersOpenTime: ordersOpenTime,
            ordersCloseTime: ordersCloseTime
        }, callback);
    },
    updateShopItem(itemID, name, description, price, maxOrders, ordersOpenTime, ordersCloseTime, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateShopItem', {
            itemID: itemID,
            newDetails: {
                name: name,
                description: description,
                price: price,
                maxOrders: maxOrders,
                ordersOpenTime: ordersOpenTime,
                ordersCloseTime: ordersCloseTime
            }
        }, callback);
    },
    updateShopItemRaw(itemID, newDetails, callback){
        AuthService.sendRequest('POST', apiHost + '/api/updateShopItem', {
            itemID: itemID,
            newDetails: newDetails
        }, callback);
    },
    fulfillOrder(orderID, callback){
        AuthService.sendRequest('POST', apiHost + '/api/fulfillOrder', {
            orderID: orderID
        }, callback);
    },
    cancelOrder(orderID, callback){
        AuthService.sendRequest('POST', apiHost + '/api/cancelOrder', {
            orderID: orderID
        }, callback);
    },
    getShopItems(callback){
        AuthService.sendRequest('GET', apiHost + '/api/getShopItems', {}, callback);
    },
    createOrder(itemID, callback){
        AuthService.sendRequest('POST', apiHost + '/api/createOrder', {
            itemID: itemID
        }, callback);
    },
    getOrders(userID, callback){
        AuthService.sendRequest('GET', apiHost + '/api/getOrders', {
            userID: userID
        }, callback);
    },
    getSubmissionBoxes(callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getSubmissionBoxes', {}, callback);
    },
    getPastSubmissions(userID, callback){
        AuthService.sendRequest('GET', apiHost + '/api/getSubmissions', {
            userID: userID
        }, callback);
    },
    getShopItem(itemID, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getItemInfo', {
            itemID: itemID
        }, callback);
    },
    getItemOrders(itemID, callback) {
        AuthService.sendRequest('GET', apiHost + '/api/getOrdersOfItem', {
            itemID: itemID
        }, callback);
    },
    setOrderCancelled(orderID, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/setOrderCancelled', {
            orderID: orderID
        }, callback)
    },
    setOrderFulfilled(orderID, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/setOrderFulfilled', {
            orderID: orderID
        }, callback)
    },
    createSubmissionBox(name, description, openDate, closeDate, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/createSubmissionBox', {
            name, description, openDate, closeDate
        }, callback)
    },
    updateSubmissionBox(submissionBoxID, name, description, openDate, closeDate, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/updateSubmissionBox', {
            submissionBoxID, name, description, openDate, closeDate
        }, callback)
    },
    awardSubmittedPoints(submissionBoxID, amount, notes, callback) {
        AuthService.sendRequest('POST', apiHost + '/api/awardSubmittedPoints', {
            submissionBoxID, amount, notes
        }, callback)
    }

};