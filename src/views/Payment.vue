<template>
    <div style="text-align: left">
<!--        <div class="title-card col-md-12">-->
<!--            <h2>PAYMENT</h2>-->
<!--        </div>-->
        <h4>PAYMENT</h4>
        <stripe-checkout
                ref="checkoutRef"
                :pk="publishableKey"
                :items="items"
                :successUrl="successUrl"
                :cancelUrl="cancelUrl"
                :customerEmail="customerEmail"
                v-if="!user.status.paid"
        >

            <template slot="checkout-button">
                <button class="generic-button-dark" @click="startPayment">Pay now</button>
            </template>
        </stripe-checkout>
        <div v-else><b>You have already paid. Please contact us at <a href="mailto:hello@masseyhacks.ca">hello@masseyhacks.ca</a> if you believe there has been a mistake.</b></div>
    </div>
</template>

<script>
    import {StripeCheckout} from 'vue-stripe-checkout'
    import Session from '../Session'
    import Swal from 'sweetalert2'
    export default {
        data() {
            return {
                user: Session.getUser(),
                publishableKey: 'pk_test_F2FfQD6ncmZsEucwmK9ctT1O00TJYElSif',
                items: [
                    {
                        sku: 'sku_GlxZDPVJuRz9eW',
                        quantity: 1
                    }
                ],
                successUrl: `http://${window.location.host}/confirmation?status=success`,
                cancelUrl: `http://${window.location.host}/confirmation?status=cancel`,
                customerEmail: Session.getUser()['email']
            }
        },
        name: "Payment",
        components: {
            StripeCheckout
        },
        mounted() {
            let success = this.$route.query.status;
            if (success === 'success') {
                Swal.fire('Payment Successful!', 'Your payment has been recorded in our server.', 'success')
            } else if (success === 'cancel') {
                Swal.fire('Payment Canceled!', 'Your card has not been charged', 'info')
            }
        },
        methods: {
            startPayment() {
                this.$refs.checkoutRef.redirectToCheckout();
            }
        }
    }
</script>

<style scoped>

</style>