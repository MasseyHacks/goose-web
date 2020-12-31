<template>
  <div class="duo-col">
    <ul style="overflow-wrap: break-word; text-align: left; list-style: none">
      <li v-for="(value, key) in displayObject" v-bind:key="key">
        <br>
        <b>{{ (key.charAt(0).toUpperCase() + key.slice(1)).replace(/([A-Z])/g, " $1")}}</b><br>{{conformData(value)}}<br>
      </li>
      <li v-if="Object.keys(displayObject).length%2 !== 0">
        <br>
        <br>
      </li>
    </ul>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: "PropertyDisplayList",
  props: {
    displayObject: {
      type: Object,
      required: true
    },
    negOneReplacement: {
      type: String,
      required: false
    },
    parseAsDates: {
      type: String,
      required: false,
      default: "false",
      validator: function (value) {
        // The value must match one of these strings
        return ['true','false'].indexOf(value) !== -1
      }
    },
    dateFormat: {
      type: String,
      required: false,
      default: "LLLL"
    }
  },
  mounted() {
    console.log(this.negOneReplacement);
  },
  methods: {
    conformData(value){
      if(value === -1 && this.negOneReplacement !== undefined){
        return this.negOneReplacement;
      }

      if(this.parseAsDates === "true"){
        return moment(value).format(this.dateFormat);
      }
      else {
        return value;
      }
    }
  }
}
</script>

<style scoped>

</style>