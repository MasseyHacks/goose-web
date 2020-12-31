<template>
  <div style="width: 100%">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="loadingError">
      {{loadingError}}
    </div>
    <div v-else class="organizer-card">
      Events Management.
    </div>
  </div>
</template>

<script>
import Session from '../Session'
import ApiService from '../ApiService'

export default {
  name: 'EventsAdmin',
  data() {
    return {
      user: Session.getUser(),
      loading: true,
      loadingError: "",
      eventsData: {}
    }
  },

  created() {

  },
  beforeMount() {
    ApiService.getAllEvents((err, data) => {
      this.loading = false;
      if (err || !data) {
        this.loadingError = err ? err.rawError.error : 'Unable to process request'
      } else {
        for(const event of data){
          this.eventsData[event._id] = event;
        }
      }
    })
  },


  methods: {
  },


}
</script>