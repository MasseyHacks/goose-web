<template>
    
</template>

<script>
    import Session from '../Session'
    import Swal from 'sweetalert2'
    import AuthService from '../AuthService'
    import LoggingService from '../LoggingService'
    import {apiHost} from '../variables'
    import ApiService from "@/ApiService";

    export default {
        name: 'Magic',
        created () {
            Swal.showLoading();
            LoggingService.debug("query token", this.$route.query.token);
            AuthService.sendRequest('POST', apiHost + '/auth/magicurl', {token: this.$route.query.token}, (err, data) => {
                if (err || !data) {
                    Swal.fire('Error', 'An error has occurred.'+ApiService.extractErrorText(err), 'error');
                    this.$router.replace('/login')
                } else {
                    Swal.fire('Success', 'Magic authentication successful', 'success');
                    Session.destroy(() => {Session.create(data.token, data.user)});
                    AuthService.updateLoginState(true);
                    this.$router.replace('/')
                }
            })
        },
    }
</script>

<style scoped>

</style>