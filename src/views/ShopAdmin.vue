<template>
  <div style="width: 100%">
    <div class="organizer-card">
      <div>
        <button class="generic-button-dark less-wide" @click="createItem">Create New</button>
      </div>
      <hr>

      <p v-if="shopError">{{shopError}}</p>
      <table class="data-table-generic" v-else>
        <tr class="table-header">
          <td>NAME</td>
          <td>DESCRIPTION</td>
          <td>PRICE</td>
          <td>MAX ORDERS</td>
          <td>ORDERS OPEN TIME</td>
          <td>ORDERS CLOSE TIME</td>
          <td>ORDERS OPEN</td>
          <td>STATUS</td>
          <td>EDIT</td>
        </tr>
        <tr v-for="shopItem in shopItems">
          <td>
            {{shopItem.name}}
          </td>
          <td>
            {{shopItem.description}}
          </td>
          <td>
            {{shopItem.price}}
          </td>
          <td>
            {{shopItem.maxOrders}}
          </td>
          <td>
            {{moment(shopItem.ordersOpenTime)}}
          </td>
          <td>
            {{shopItem.ordersCloseTime === -1 ? "Never" : moment(shopItem.ordersCloseTime)}}
          </td>
          <td>
            {{shopItem.ordersOpen ? "Open" : "Closed"}}
          </td>
          <td>
            <button class="generic-button-dark less-wide" v-on:click="toggleItemStatus(shopItem._id, shopItem.disabled)">{{ shopItem.disabled ? "Enable" : "Disable" }}</button>
          </td>
          <td>
            <button class="generic-button-dark less-wide" v-on:click="editItem(shopItem._id)">Edit</button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import Swal from 'sweetalert2'
import ApiService from '../ApiService'
import moment from "moment";

export default {
  name: 'ShopAdmin',
  data() {
    return {
      user: Session.getUser(),
      shopError: "",
      shopItems: {},
      shopItemsMap: {}
    }
  },

  created() {
  },
  beforeMount() {
    ApiService.getShopItems((err, data) => {
      if(err){
        this.shopError = ApiService.extractErrorText(err);
      }
      else{
        this.shopItems = data.shopItems;

        for(let i=0;i<this.shopItems.length;i++){
          this.shopItemsMap[this.shopItems[i]._id] = i;
        }
      }
    });
  },
  methods: {
    moment(date, format){
      return moment(date).format(format ? format : "LLLL");
    },
    convertDateEditStringToDate(string){
      if(string === "-1"){
        return -1;
      }
      return moment(string).unix() * 1000
    },
    createItem() {
      Swal.fire({
        title: 'Enter Item Information',
        html: '<label for="itemEdit-name" class="text-left float-left">Name</label>' +
            '<input type="text" class="form-control" id="itemEdit-name" placeholder="Cool Item">' +

            '<label for="itemEdit-description" class="text-left float-left">Description</label>' +
            '<textarea type="text" class="form-control" id="itemEdit-description" placeholder="One of the coolest items in the galaxy."></textarea>' +

            '<label for="itemEdit-price" class="text-left float-left">Price</label>' +
            '<input type="text" class="form-control" id="itemEdit-price">' +

            '<label for="itemEdit-maxOrders" class="text-left float-left">Max Orders</label>' +
            '<input type="text" class="form-control" id="itemEdit-maxOrders" value="-1">' +

            '<label for="itemEdit-ordersOpenTime" class="text-left float-left">Orders Open Time</label>' +
            `<input type="text" class="form-control" id="itemEdit-ordersOpenTime" value="${moment(0).format('YYYY-MM-DDTHH:mm:ssZ')}">` +

            '<label for="itemEdit-ordersClose" class="text-left float-left">Orders Close Time</label>' +
            `<input type="text" class="form-control" id="itemEdit-ordersClose" value="${moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ')}">`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('itemEdit-name').value, document.getElementById('itemEdit-description').value,
            document.getElementById('itemEdit-price').value, document.getElementById('itemEdit-maxOrders').value,
            this.convertDateEditStringToDate(document.getElementById('itemEdit-ordersOpenTime').value), this.convertDateEditStringToDate(document.getElementById('itemEdit-ordersClose').value)];
        }
      }).then((info) => {
        if(info.value){
          let name = info.value[0];
          let description = info.value[1];
          let price = info.value[2];
          let maxOrders = info.value[3];
          let ordersOpenTime = info.value[4];
          let ordersClose = info.value[5];

          ApiService.createShopItem(name, description, price, maxOrders, ordersOpenTime, ordersClose, (err, data) => {
            if(err){
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'There was an error creating the item.' + ApiService.extractErrorText(err)
              })
            }
            else {
              Swal.fire({
                type: 'success',
                title: 'Success',
                text: 'Item was successfully created! Item ID: ' + data._id
              }).then((result) =>{
                this.$router.go();
              })
            }
          })
        }
      })
    },
    editItem(itemID){
      let itemInfo = this.shopItems[this.shopItemsMap[itemID]];

      Swal.fire({
        title: 'Enter Item Information',
        html: '<label for="itemEdit-name" class="text-left float-left">Name</label>' +
            `<input type="text" class="form-control" id="itemEdit-name" value="${itemInfo.name}">` +

            '<label for="itemEdit-description" class="text-left float-left">Description</label>' +
            `<textarea type="text" class="form-control" id="itemEdit-description">${itemInfo.description}</textarea>` +

            '<label for="itemEdit-price" class="text-left float-left">Price</label>' +
            `<input type="text" class="form-control" id="itemEdit-price" value="${itemInfo.price}">` +

            '<label for="itemEdit-maxOrders" class="text-left float-left">Max Orders</label>' +
            `<input type="text" class="form-control" id="itemEdit-maxOrders" value="${itemInfo.maxOrders}">` +

            '<label for="itemEdit-ordersOpenTime" class="text-left float-left">Orders Open</label>' +
            `<input type="text" class="form-control" id="itemEdit-ordersOpenTime" value="${moment(itemInfo.ordersOpenTime).format('YYYY-MM-DDTHH:mm:ssZ')}">` +

            '<label for="itemEdit-ordersClose" class="text-left float-left">Orders Close</label>' +
            `<input type="text" class="form-control" id="itemEdit-ordersClose" value="${itemInfo.ordersClose == -1 ? -1 : moment(itemInfo.ordersClose).format('YYYY-MM-DDTHH:mm:ssZ')}">`,
        showCancelButton: true,
        cancelButtonColor: '#dd3333',
        focusConfirm: false,
        preConfirm: () => {
          return [document.getElementById('itemEdit-name').value, document.getElementById('itemEdit-description').value,
            document.getElementById('itemEdit-price').value, document.getElementById('itemEdit-maxOrders').value,
            this.convertDateEditStringToDate(document.getElementById('itemEdit-ordersOpenTime').value), this.convertDateEditStringToDate(document.getElementById('itemEdit-ordersClose').value)];
        }
      }).then((info) => {
        if(info.value){
          let name = info.value[0];
          let description = info.value[1];
          let price = info.value[2];
          let maxOrders = info.value[3];
          let ordersOpenTime = info.value[4];
          let ordersClose = info.value[5];

          ApiService.updateShopItem(itemID, name, description, price, maxOrders, ordersOpenTime, ordersClose, (err, data) => {
            if(err){
              Swal.fire({
                type: 'error',
                title: 'Error',
                text: 'There was an error editing the item.' + ApiService.extractErrorText(err)
              })
            }
            else {
              Swal.fire({
                type: 'success',
                title: 'Success',
                text: 'Item was successfully updated.'
              }).then((result) =>{
                this.$router.go();
              })
            }
          })
        }
      })
    },
    toggleItemStatus(itemID, currentStatus){
      ApiService.updateShopItemRaw(itemID, {
        disabled: !currentStatus
      }, (err, data) => {
        if(err){
          Swal.fire({
            type: 'error',
            title: 'Error',
            text: 'There was an error toggling item status.' + ApiService.extractErrorText(err)
          })
        }
        else{
          Swal.fire({
            type: 'success',
            title: 'Success',
            text: 'Item status was toggled.'
          }).then((result) =>{
            this.$router.go();
          })
        }
      })
    }
  },


}
</script>