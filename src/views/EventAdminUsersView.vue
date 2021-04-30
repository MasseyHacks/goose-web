<template>
  <div style="width: 100%">
    <div class="organizer-card">
      <div class="ui-card dash-card-large">
        <!--<h3>USERS:</h3>-->
        <div v-if="loading">
          Loading...
        </div>
        <div v-else-if="loadingError">
          {{ loadingError }}
        </div>
        <div v-else>
          <router-link :to="{path: returnPath}">
            <button class="generic-button-dark less-wide">Back</button>
          </router-link>
          <h3 class="mt-3">{{this.mode === "checkedin" ? "CHECKED IN" : "REGISTERED"}} USERS</h3>
          <div v-if="users.length != 0 && !queryError">
            <hr>
            <button class="generic-button-dark wide" v-on:click="exportUsersCSV">Export</button>
            <button class="generic-button-dark wide" :disabled="page == 1" v-on:click="switchPage(page - 1)">
              Previous
            </button>
            <button class="generic-button-dark wide" :disabled="page == totalPages"
                    v-on:click="switchPage(page + 1)">Next
            </button>
            <button class="generic-button-dark wide" v-on:click="toggleSearchMode">{{this.mode === "checkedin" ? "View Registered" : "View Checked In"}}</button>

            <br>
            <br>
            {{ page }} of {{ totalPages }} | {{ count }} result<span v-if="count > 1">s</span>

            <hr>
            <div style="overflow-x: auto; max-width: 100%">
              <table class="data-table-generic">
                <tr class="table-header">
                  <td>NAME</td>
<!--                  <td>V/S/A/R/C/W</td>-->
<!--                  <td>VOTES</td>-->
                  <td>EMAIL</td>
                  <td>SCHOOL</td>
                  <td>GRADE</td>
                  <td>POINTS</td>
                </tr>
                <router-link type="tr" v-for="user in users"
                             :to="{path: '/organizer/userview?username='+user.id, params: {username: user.fullName}}"
                             v-bind:key="user.id"
                             tag="tr">
                  <td style="max-width: 150px;">
                    {{ user.fullName }}
                  </td>
<!--                  <td style="min-width: 150px;"><span v-html="userStatusConverter(user)"></span></td>-->
<!--                  <td>{{ user.numVotes }}</td>-->
                  <td class="email-col">{{ user.email }}</td>
                  <td style="max-width: 100px;">{{ user.profile.hacker ? user.profile.hacker.school : ""}}</td>
                  <td>{{ user.profile.hacker ? user.profile.hacker.grade : "" }}</td>
                  <td>{{ user.points.total }}</td>
                </router-link>
              </table>
            </div>
          </div>
          <p v-else>
            {{ queryError }}
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '../ApiService'
import LoggingService from '../LoggingService'
import {saveAs} from 'file-saver'
import Swal from 'sweetalert2'
import {VueContext} from 'vue-context'

export default {
  name: 'EventAdminUsers',
  data() {
    return {
      page: 1,
      totalPages: 1,
      count: 0,

      loading: true,
      loadingError: '',
      queryError: '',

      users: {},
      returnPath: "/organizer/events",
      eventID: "",
      mode: ""
    }
  },
  beforeMount() {
    if (this.$route.query["returnPath"]) {
      this.returnPath = this.$route.query["returnPath"]
    }

    this.eventID = this.$route.query["eventID"];

    this.mode = this.$route.query["mode"] || "registered";
    // ApiService.getUsers({page: this.page, size: 100, sort: {"firstName": 1, "lastName": 1}}, (err, data) => {
    //     this.loading = false;
    //
    //     if (err || !data) {
    //         this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
    //     } else {
    //         this.users = data.users;
    //         this.totalPages = data.totalPages;
    //         this.count = data.count;
    //
    //         if (this.users.length == 0) {
    //             this.queryError = 'No users found'
    //         }
    //     }
    // });

    if(this.mode === "checkedin"){
      ApiService.getEventCheckedInUsers(this.eventID, this.page, 40, (err, data) => {
        this.loading = false;

        if (err || !data) {
          this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
        } else {
          this.users = data.users;
          this.totalPages = data.totalPages;
          this.count = data.count;

          if (this.users.length === 0) {
            this.queryError = 'No users found'
          }
        }
      })
    }
    else{
      ApiService.getEventRegisteredUsers(this.eventID, this.page, 40, (err, data) => {
        this.loading = false;

        if (err || !data) {
          this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
        } else {
          this.users = data.users;
          this.totalPages = data.totalPages;
          this.count = data.count;

          if (this.users.length === 0) {
            this.queryError = 'No users found'
          }
        }
      });
    }

  },

  components: {
    VueContext
  },

  methods: {
    prettify: function (str) {
      var strProc = str;
      if (str.indexOf('.') != -1) {
        strProc = str.slice(str.indexOf('.') + 1)
      }
      return strProc.replace(/([A-Z])/g, ' $1').replace(/^./, function (strProc) {
        return strProc.toUpperCase();
      })
    },

    // sortBy: function (field) {
    //   var sort = {};
    //
    //   if (this.currentSorting === field) {
    //     this.reverseSorted = !this.reverseSorted
    //   } else {
    //     this.currentSorting = field;
    //     this.reverseSorted = false
    //   }
    //
    //   if (field == "fullName") {
    //     sort["firstName"] = this.reverseSorted === true ? -1 : 1;
    //     sort["lastName"] = this.reverseSorted === true ? -1 : 1
    //   } else {
    //     sort[field] = this.reverseSorted === false ? -1 : 1
    //   }
    //   ApiService.getUsers({page: this.page, size: 100, filters: this.filters, sort: sort}, (err, data) => {
    //     this.loading = false;
    //
    //     if (err || !data) {
    //       this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
    //     } else {
    //       this.users = data.users;
    //       this.totalPages = data.totalPages;
    //       this.count = data.count;
    //
    //       if (this.users.length == 0) {
    //         this.queryError = 'No users found'
    //       }
    //     }
    //   })
    // },

    // deleteFilter: function (logical, filter) {
    //     this.filters[logical].splice(this.filters[logical].indexOf(filter), 1);
    //
    //     if (this.filters[logical].length == 0) {
    //         delete this.filters[logical];
    //     }
    //
    //     this.updateSearch()
    // },
    //
    // // Changes comparison operator to valid state
    // changeFieldName: function () {
    //     switch (this.queryField.type) {
    //         case "Boolean": // Only true/false are valid in this case
    //             if (['true', 'false'].indexOf(this.queryComparison) == -1) {
    //                 this.queryComparison = 'true';
    //                 this.queryTargetValue = ''
    //             }
    //
    //             break;
    //         case "Number": // Regex cannot be used with numbers
    //             if (this.queryComparison == '$regex') {
    //                 this.queryComparison = '$eq'
    //             }
    //
    //             break;
    //         default: // Strings
    //             if (['true', 'false'].indexOf(this.queryComparison) != -1) {
    //                 this.queryComparison = '$eq'
    //             }
    //     }
    // },

    // resetQuery: function () {
    //     this.queryLogical = '$and';
    //     this.queryComparison = this.queryField.type == 'Boolean' ? 'true' : '$eq';
    //     this.queryTargetValue = ''
    // },
    //
    // addQuery: function () {
    //
    //     var query = {};
    //     var subQuery = {};
    //
    //     // Make it case insensitive
    //     if (this.queryComparison == '$regex') {
    //         subQuery['$options'] = 'i'
    //     }
    //
    //     // Generate inner query <'$eq':'foo'>
    //     subQuery[this.queryComparison] = this.queryTargetValue;
    //
    //     // Generate outer query <'firstName':subQuery>
    //     query[this.queryField.name] = this.queryField.type == 'Boolean' ? this.queryComparison : subQuery;
    //
    //     if (this.queryLogical in this.filters) {
    //         if (!this.filters[this.queryLogical].map(x => JSON.stringify(x)).includes(JSON.stringify(query))) { // Figure out why this doesn't work
    //             this.filters[this.queryLogical].push(query)
    //         } else {
    //             Swal.fire('This filter already exists!')
    //         }
    //     } else {
    //         this.filters[this.queryLogical] = [query]
    //     }
    //
    //     this.updateSearch();
    //     this.resetQuery();
    //     this.queryField = {}
    // },

    // clearQuery: function () {
    //     this.filters = {};
    //     this.updateSearch()
    // },
    //
    // updateAdvancedFilter: function () {
    //     try {
    //         this.filters = JSON.parse(this.advancedQueryContent);
    //         this.updateSearch()
    //     } catch (e) {
    //         this.queryError = 'Invalid Query'
    //     }
    // },
    //
    updateSearch: function (resetPage) {
        if (!resetPage) {
            this.page = 1
        }

      if(this.mode === "checkedin"){
        ApiService.getEventCheckedInUsers(this.eventID, this.page, 40, (err, data) => {
          this.loading = false;

          if (err || !data) {
            this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
          } else {
            this.users = data.users;
            this.totalPages = data.totalPages;
            this.count = data.count;

            if (this.users.length === 0) {
              this.queryError = 'No users found'
            }
          }
        })
      }
      else{
        ApiService.getEventRegisteredUsers(this.eventID, this.page, 40, (err, data) => {
          this.loading = false;

          if (err || !data) {
            this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
          } else {
            this.users = data.users;
            this.totalPages = data.totalPages;
            this.count = data.count;

            if (this.users.length === 0) {
              this.queryError = 'No users found'
            }
          }
        })
      }

    },

    exportUsersCSV: function () {
      ApiService.getUsers({page: 1, size: 100000, text: this.searchQuery, filters: this.filters}, (err, data) => {
        if (err || !data) {
          this.loadingError = 'Unable to process request.' + ApiService.extractErrorText(err)
        } else {
          var csvArray = [];
          for (var i = 0; i < data.users.length; i++) {
            csvArray[i] = this.flattenObject(data.users[i]);
          }
          this.genCSV(csvArray);
        }
      })
    },
    flattenObject: function (data, prefix = "", level = 0) {
      var tempObj = {};
      if (level < 6) {
        Object.keys(data).forEach((key) => {
          if (data[key] === Object(data[key])) {
            //iterate again!
            tempObj = Object.assign(tempObj, this.flattenObject(data[key], prefix + key + "/", level += 1));
          } else {
            //log the value
            tempObj[prefix + key] = data[key];
          }
        });
        if (prefix === "") {
          tempObj["documentKeys"] = Object.keys(tempObj);
        }
        return tempObj;
      } else {
        LoggingService.log("recursion limit reached!");
        return {};
      }
    },
    genCSV: function (objArray) {
      var output = [];
      var headers = [];

      //get all the headers
      for (var i = 0; i < objArray.length; i++) {
        headers = this.mergeArray(headers, objArray[i]["documentKeys"]);
      }

      output[0] = headers.toString();

      //generate the output
      var regex = new RegExp("\"", 'g');
      for (var i = 0; i < objArray.length; i++) {
        output[i + 1] = "";
        for (var j = 0; j < headers.length; j++) {
          if (objArray[i][headers[j]] !== undefined) {
            if (typeof objArray[i][headers[j]] === "string" || objArray[i][headers[j]] instanceof String) {
              output[i + 1] += "\"" + objArray[i][headers[j]].replace(regex, "\"\"") + "\"" + ",";
            } else {
              output[i + 1] += JSON.stringify(objArray[i][headers[j]]) + ",";
            }
          } else {
            output[i + 1] += ",";
          }
        }
        output[i + 1] = output[i + 1].slice(0, -1);
      }

      var outputStr = "";
      for (var i = 0; i < output.length; i++) {
        outputStr += output[i] + "\n";
      }

      var filename = "Users-export-" + new Date() + ".csv";
      var blob = new Blob([outputStr], {
        type: "text/csv;charset=utf-8"
      });

      saveAs(blob, filename);

    },
    mergeArray: function () {
      /** Courtesy of George Ruth on Stack Overflow **/
      var args = arguments;
      var hash = {};
      var arr = [];
      for (var i = 0; i < args.length; i++) {
        for (var j = 0; j < args[i].length; j++) {
          if (hash[args[i][j]] !== true) {
            arr[arr.length] = args[i][j];
            hash[args[i][j]] = true;
          }
        }
      }
      return arr;
    },
    userStatusConverter: function (user) {
      var responseArray = {
        'V': '',
        'S': '',
        'A': '',
        'R': '',
        'C': '',
        'W': ''
      };

      if (user.permissions.verified) {
        responseArray['V'] = '<i class="fas fa-check"></i>'
      } else {
        responseArray['V'] = '<i class="fas fa-ban"></i>'
      }
      if (user.status.submittedApplication) {
        responseArray['S'] = '<i class="fas fa-check"></i>'
      } else {
        responseArray['S'] = '<i class="fas fa-ban"></i>'
      }
      if (user.status.admitted) {
        responseArray['A'] = '<i class="fas fa-check"></i>'
      } else {
        if (!user.status.rejected) {
          responseArray['A'] = '<i class="far fa-question-circle"></i>'
        } else {
          responseArray['A'] = '<i class="fas fa-ban"></i>'
        }
      }
      if (user.status.confirmed) {
        responseArray['C'] = '<i class="fas fa-check"></i>'
      } else {
        responseArray['C'] = '<i class="fas fa-ban"></i>'
      }
      if (user.status.waiver) {
        responseArray['W'] = '<i class="fas fa-check"></i>'
      } else {
        responseArray['W'] = '<i class="fas fa-ban"></i>'
      }
      if (user.status.statusReleased) {
        responseArray['R'] = '<i class="fas fa-check"></i>'
      } else {
        responseArray['R'] = '<i class="fas fa-ban"></i>'
      }


      var finalReponse = '';

      for (var str in responseArray) {
        finalReponse += responseArray[str]
      }
      return finalReponse
    },

    switchPage: function (page) {
      this.page = page;
      this.updateSearch(true)
    },

    toggleSearchMode: function(){
      this.mode = this.mode === "checkedin" ? "registered" : "checkedin";
      this.page = 1;
      this.updateSearch(true);
    }

    /*,

    toggleNormalOnly: function() {
        if (this.filters.length > 0) {
            if (this.filters['$and'].length > 0) {
                this.filters['$and'][0]['permissions.checkin'] = this.displayOrganizers.toString()
                LoggingService.log(this.displayOrganizers)
            }
        }
        LoggingService.log(this.filters)
        this.updateSearch()
    }*/
  }
}
</script>


<style>
.ql-editor {
  height: 50vh !important;
  width: 50vw !important;
  overflow-y: auto !important;
  overflow-x: auto !important;
}

.ql-syntax {
  display: inline-block !important;
}

.ql-syntax span {
  display: inline-block !important;
  white-space: nowrap;
}

</style>
