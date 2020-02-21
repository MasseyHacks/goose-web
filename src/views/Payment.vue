<template>
    <div class="app-screen">
        <div class="title-card col-md-12">
            <h2>PAYMENT</h2>
        </div>
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
        <div v-else>paid already</div>
    </div>
</template>

<script>
    import {StripeCheckout} from 'vue-stripe-checkout'
    import Session from '../Session'
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
                successUrl: 'https://google.com',
                cancelUrl: 'https://google.com',
                customerEmail: Session.getUser()['email']
            }
        },
        name: "Payment",
        components: {
            StripeCheckout
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