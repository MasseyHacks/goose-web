<template>
  <div style="width: 100%">
    <div class="organizer-card">
      <div class="ui-card dash-card-large">
        <router-link :to="{path: returnPath}">
          <button class="generic-button-dark less-wide">Back</button>
        </router-link>
        <hr>
        <h3 v-if="item.name">{{item.name.toUpperCase()}}</h3>
        <label>Hide completed <input type="checkbox" v-model="hideCompleted" checked></label>
        <div style="overflow-x: auto; max-width: 100%">
          <table class="data-table-generic">
            <tr class="table-header">
              <td>USER</td>
              <td>STATUS</td>
              <td>PURCHASE TIME</td>
              <td>CANCEL</td>
              <td>FULFILL</td>
            </tr>
            <tr v-for="order of orders" v-if="order.status === 'Open' || !hideCompleted">
              <td>
                <router-link :to="{path: '/organizer/userview', query: {
                  username: order.purchaseUser,
                  returnPath: $route.fullPath
                }}">{{order.purchaseUserFullName}}</router-link>
              </td>
              <td>
                {{order.status}}
              </td>
              <td>
                {{moment(order.purchaseTime)}}
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="cancelOrder(order._id)" :disabled="order.status === 'Fulfilled' || order.status === 'Cancelled'">Cancel</button>
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="fulfillOrder(order._id)" :disabled="order.status === 'Fulfilled' || order.status === 'Cancelled'">Fulfill</button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'
import AuthService from "../AuthService";
import Swal from 'sweetalert2';
import moment from "moment";

export default {
  name: 'OrdersAdmin',
  data() {
    return {
      user: Session.getUser(),
      returnPath: "/organizer/orders",
      itemID: "",
      item: {},
      orders: [],
      hideCompleted: true
    }
  },

  created() {
  },

  mounted() {
    if (this.$route.query["returnPath"]) {
      this.returnPath = this.$route.query["returnPath"]
    }

    this.itemID = this.$route.query["itemID"];

    ApiService.getShopItem(this.itemID, (err, item) => {
      this.item = item;
    })

    ApiService.getItemOrders(this.itemID, (err, orders) => {
      this.orders = orders;
    })
  },

  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    },
    cancelOrder(orderID) {
      AuthService.skillTest(() => {
        ApiService.setOrderCancelled(orderID, (err, res) => {
          if(err) {
            Swal.fire({
              type: 'error',
              title: 'error',
              text: 'There was an error cancelling the order. ' + ApiService.extractErrorText(err)
            })
          }
          else {
            Swal.fire({
              type: 'success',
              title: 'Success',
              text: 'Successfully cancelled the order.'
            }).then(() => {
              for(let i=0;i<this.orders.length;i++){
                if(this.orders[i]._id === orderID){
                  this.orders[i].status = "Cancelled";
                }
              }
            })
          }
        });
      })
    },
    fulfillOrder(orderID) {
      ApiService.setOrderFulfilled(orderID, (err, res) => {
        if(err) {
          Swal.fire({
            type: 'error',
            title: 'error',
            text: 'There was an error fulfilling the order. ' + ApiService.extractErrorText(err)
          })
        }
        else {
          Swal.fire({
            type: 'success',
            title: 'Success',
            text: 'Successfully fulfilled the order.'
          }).then(() => {
            for(let i=0;i<this.orders.length;i++){
              if(this.orders[i]._id === orderID){
                this.orders[i].status = "Fulfilled";
              }
            }
          })
        }
      });
    }
  }
}
</script>