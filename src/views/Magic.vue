<template>
    
</template>

<script>
    import Session from '../Session'
    import Swal from 'sweetalert2'
    import AuthService from '../AuthService'
    import {apiHost} from '../variables'

    export default {
        name: 'Magic',
        created () {
            Swal.showLoading();
            console.log(this.$route.query.token);
            AuthService.sendRequest('POST', apiHost + '/auth/magicurl', {token: this.$route.query.token}, (err, data) => {
                if (err || !data) {
                    Swal.fire('Error', 'An error has occurred', 'error');
                    console.log(err.responseJSON.error);
                    this.$router.replace('/login')
                } else {
                    Swal.fire('Success', 'Magic authentication successful', 'success');
                    console.log(data);
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