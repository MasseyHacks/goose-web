<template>
  <div style="width: 100%">
    <div class="organizer-card">
      Points management.
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