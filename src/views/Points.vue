<template>
  <div class="app-screen">
    <div class="container">
      <div class="row">
        <div class="title-card col-md-12">
          <h2>POINTS</h2>
          <h4>You currently have {{user.points.total}} points</h4>
        </div>
      </div>

      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Redeem Points</h3>

          <hr>
          <p v-if="shopError">{{shopError}}</p>
          <table class="data-table-generic" v-else>
            <tr class="table-header">
              <td>NAME</td>
              <td>DESCRIPTION</td>
              <td>PRICE</td>
              <td>ORDERS CLOSE</td>
              <td>BUY</td>
            </tr>
            <tr v-for="shopItem in shopItems">
              <td>
                {{shopItem.name}}
              </td>
              <td>
                {{shopItem.description}}
              </td>
              <td>
                {{moment(shopItem.ordersCloseTime)}}
              </td>
              <td>
                {{shopItem.price}}
              </td>
              <td>
                <button class="generic-button-dark less-wide" v-on:click="purchaseItem(shopItem.name, shopItem.price, shopItem._id)" :disabled="user.points.total < shopItem.price">{{user.points.total < shopItem.price ? 'Not Enough Points' : 'Buy'}}</button>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding-bottom: 30px">
          <div class="ui-card dash-card-offset dash-card dash-card-large">
            <h3>Order History</h3>

            <hr>
            <p v-if="ordersError">{{ordersError}}</p>
            <table class="data-table-generic" v-else>
              <tr class="table-header">
                <td>ID</td>
                <td>ITEM</td>
                <td>ORDER DATE</td>
                <td>PRICE</td>
                <td>STATUS</td>
              </tr>
              <tr v-for="order in orders">
                <td>
                  {{order._id}}
                </td>
                <td>
                  {{order.itemName}}
                </td>
                <td>
                  {{moment(order.purchaseTime)}}
                </td>
                <td>
                  {{order.purchasePrice}}
                </td>
                <td>
                  {{order.status}}
                </td>
              </tr>
            </table>
          </div>
        </div>

      </div>
      <div style="padding-bottom: 30px">
        <div class="ui-card dash-card-offset dash-card dash-card-large">
          <h3>Points History</h3>
          <hr>
          <div v-for="pointEntry in reversePointEntries" style="margin:0.5em">
            <div class="collapsible" style="word-wrap: break-word">
              {{moment(parseInt( pointEntry._id.substring(0,8), 16 ) * 1000)}}<br>
              <b>{{pointEntry.amount >= 0 ? "+" : ""}}{{pointEntry.amount}} points</b><br>
              <span>{{pointEntry.notes}}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import moment from 'moment';
import Session from "../Session";
import ApiService from "@/ApiService";

export default {
  name: 'Points',
  data() {
    return {
      user: Session.getUser(),
      settings: Session.getSettings(),
      shopItems: {},
      shopError: "",
      orders: {},
      ordersError: ""
    }
  },
  beforeMount() {
    ApiService.getShopItems((err, data) => {
      if(err){
        this.shopError = ApiService.extractErrorText(err);
      }
      else{
        this.shopItems = data.shopItems;
      }
    });

    ApiService.getOrders(this.user._id, (err, data) => {
      if(err){
        this.ordersError = ApiService.extractErrorText(err);
      }
      else{
        this.orders = data.orders;
      }
    });
  },
  computed: {
    reversePointEntries() {
      return this.user.points.history.slice().reverse();
    }
  },
  methods: {
    moment (date) {
      return moment(date).format('MMMM Do YYYY [at] h:mm:ss a')
    },
    purchaseItem(itemName, price, itemID){
      Swal.fire({
        type: 'warning',
        title: 'Are you sure?',
        html: `You are about to purchase <strong>${itemName}</strong> for <strong>${price}</strong> points! Purchases are non-reversible!`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false
      }).then((result) => {
        if(result.value){
          ApiService.createOrder(itemID, (err, data) => {
            if(err){
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'There was an error placing your order. ' + ApiService.extractErrorText(data)
              })
            }
            else {
              Swal.fire({
                type: 'success',
                title: 'Success!',
                text: data.message
              })
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.collapsible {
  background-color: #777;
  color: white;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}
.collapsible:hover {
  background-color: #555;
}

</style>
