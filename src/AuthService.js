/* globals localStorage */

import $ from 'jquery'
import Session from './Session'
import LoggingService from './LoggingService'
import Swal from 'sweetalert2'
import { apiHost } from "./variables";
import axios from 'axios'

export default {

    sendRequest (type, url, data, callback, contentType, async) {
    //     var request = {
    //         type: type,
    //         url: url,
    //         async: async,
    //         contentType: contentType || 'application/json; charset=utf-8',
    //         dataType: 'json',
    //         success: data => {
    //             if (callback) callback(null, data)
    //         },
    //         error: data => {
    //             if (data && (data.status == 401 || data.status == 403) && Session.loggedIn() && !url.includes('changePassword')) {
    //                 this.logout(null, 'Permission error occurred. Please login again.')
    //             }
    //
    //             if (!'error' in data) {
    //                 data['error'] = 'Something went wrong'
    //             }
    //
    //             if (callback) callback(data)
    //         }
    //     };
        axios({
            method: type,
            url: url,
            data: data,
            headers: {
                'x-access-token': Session.getToken(),
                'content-type': contentType
            },
            params: type === 'GET' ? data : null
        }).then(response => {
            LoggingService.debug("response", response)
            if (callback) {
                return callback(null, response.data)
            }
        }).catch(error => {
            LoggingService.debug("error & response", error, data);
            if (error.data && (error.data.status == 401 || error.data.status == 403) && Session.loggedIn() && !url.includes('changePassword')) {
                this.logout(null, 'Permission error occurred. Please login again.')
            }
            callback({rawError: {error: error}}, {'error': 'This message is deprecated.'})

            // if (!('error' in error.data)) {
            //     error.data['error'] = 'Something went wrong'
            // }
            //
            // if (callback) {
            //     callback(error.data)
            // }
        });

        // if (data) {
        //     request['data'] = type == 'POST' ? JSON.stringify(data) : data
        // }
        //
        // if (Session.loggedIn() || Session.getToken()) {
        //     request['beforeSend'] = xhr => {xhr.setRequestHeader('x-access-token', Session.getToken())}
        // }
        //
        // $.ajax(request)
    },
    
    skillTest(callback) {
        Swal.showLoading();

        var sudoMode = sessionStorage.getItem('sudoMode') ? sessionStorage.getItem('sudoMode') : false;

        this.sendRequest('GET', apiHost + '/api/skill', {}, (err, data) => {

            if (err || sudoMode) {
                Swal.fire({
                    title: (sudoMode ? '[SUDO MODE]\n' : '') + 'Disastrous Action Final Confirmation',
                    html: 'Security policy requires that all \'disastrous\' actions be confirmed with a skill test. By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.<br><br>To promote mathematics and STEM, MasseyHacks Platform Department will issue a SkillTest Fail Bad no good point if you bypass using SUDO mode. K thx bye.<br><br>',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    dangerMode: true,
                    footer: 'MasseyHacks | Platform Division',
                }).then((result) => {
                    if (result.value) {
                        this.sendRequest('POST', apiHost + '/api/skillFail', {}, (err, data) => {});

                        callback()
                    } else {
                        Swal.fire({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                });

                Swal.showValidationError(
                    sudoMode ? 'SUDO MODE ENABLED' : `Unable to get skill question`
                )
            } else {
                Swal.fire({
                    title: 'Disastrous Action Final Confirmation',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm',
                    html: 'Security policy requires that all \'disastrous\' actions be confirmed with a skill test. By proceeding, you understand and assume full responsibility of all risks and/or damage (potentially) incurred.<br><br>' + data.instruction + '<br>' + data.question,
                    input: 'text',
                    footer: 'MasseyHacks | Platform Division',
                    preConfirm: (answer) => {

                        if (answer != data.answer) {

                            this.sendRequest('POST', apiHost + '/api/skillFail', {}, (err, data) => {});

                            Swal.showValidationError(
                                `Wrong answer!`
                            )

                        } else {
                            this.sendRequest('POST', apiHost + '/api/skillPass', {}, (err, data) => {});

                            return 'ok'
                        }
                    }
                }).then((result) => {
                    if (result.value) {
                        callback()
                    } else {
                        Swal.fire({
                            title: 'Action aborted',
                            type: 'error'
                        })
                    }
                })
            }
        })

    },

    adminChangePassword(fullName, userID, callback) {
        Swal.fire({
            title: 'Change user password',
            html: 'Enter a new password for ' + fullName,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Change',
            input: 'password',
            footer: 'MasseyHacks | Platform Division',
            preConfirm: (pw) => {

                if (pw.length < 6) {
                    Swal.showValidationError(
                        `Must be at least 6 characters long!`
                    )
                } else {
                    return pw
                }
            }
        }).then((result) => {

            if (result.value) {

                this.skillTest(() => {

                    this.sendRequest('POST', apiHost + '/auth/adminChangePassword', {
                        userID: userID,
                        password: result.value
                    }, (err, data) => {
                        if (err) {
                            if (callback) callback(err)
                        } else {
                            if (callback) callback(null, data)
                        }
                    })

                })

            }
        });
    },

    changePassword(oldPassword, newPassword, callback) {
        this.sendRequest('POST', apiHost + '/auth/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

                if (callback) callback(null, data)
            }
        })
    },

    register(email, firstName, lastName, password, callback) {
        this.sendRequest('POST', apiHost + '/auth/register', {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

                if (callback) callback(null, data)
            }
        })
    },

    loginWithPassword (email, password, callback) {
        this.sendRequest('POST', apiHost + '/auth/login', {
            email: email,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                LoggingService.debug('data', data);
                if (data['user']['2FA']) {
                    Session.create2FA(data['token'], data['user']);
                    return callback(null, data['user'])
                } else {
                    Session.create(data['token'], data['user']);
                    this.updateLoginState(true);

                    if (callback) callback(null, data)
                }
            }
        })
    },

    refreshToken() {
        // Login with token if it exists
        if (Session.loggedIn()) {
            LoggingService.debug('Token refreshed!');
            this.loginWithToken()
        } else {
            LoggingService.debug('Session does not exist')
        }
    },

    loginWithToken () {
        this.sendRequest('POST', apiHost + '/auth/tokenLogin', {

        }, (err, data) => {
            if (err) {
                this.logout()
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true)
            }
        }, null, false)
    },

    loginWithCode (code, callback) {
        this.sendRequest('POST', apiHost + '/auth/2FA', {
            'code':code
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                Session.create(data['token'], data['user']);
                this.updateLoginState(true);

                if (callback) callback(null, data)
            }
        })
    },

    verify(token, callback) {
        this.sendRequest('POST', apiHost + '/auth/verify', {
            token: token
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                if (callback) callback(null)
            }
        })
    },

    resetPasswordWithToken(token, password, callback) {
        this.sendRequest('POST', apiHost + '/auth/reset', {
            token: token,
            password: password
        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                this.logout(null, 'The session has expired');
                if (callback) callback(null, data)
            }
        })
    },

    requestReset (email, callback) {
        this.sendRequest('POST', apiHost + '/auth/requestReset', {
            email: email
        }, (err, data) => {
            if (err) {
                LoggingService.debug('requestReset error', err);
                if (callback) callback(err)
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    requestVerify(callback) {
        this.sendRequest('POST', apiHost + '/auth/requestVerify', {

        }, (err, data) => {
            if (err) {
                if (callback) callback(err)
            } else {
                if (callback) callback(null, data)
            }
        })
    },

    logout (callback, message) {
        Session.destroy(callback);
        this.updateLoginState(false, message)
    },

    updateLoginState(state) {}
};