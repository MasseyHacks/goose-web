<template>
  <div style="width: 100%">
    <div class="organizer-card">
      <div class="ui-card dash-card-large">
        Orders management.
      </div>
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'

export default {
  name: 'OrdersAdmin',
  data() {
    return {
      user: Session.getUser()
    }
  },

  created() {
  },


  methods: {
  },


}
</script>