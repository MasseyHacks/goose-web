<template>
    <div class="app-screen">
        <div style="display: inline-block;">
            <div class="container">
                <div class="row">
                    <div class="title-card col-md-12">
                        <h2>ORGANIZER</h2>
                    </div>
                </div>

            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="ui-card dash-card-large">
                        <router-link to="/organizer/statistics">
                            <button class="generic-button-dark wide">Statistics</button>
                        </router-link>
                        <router-link to="/organizer/users">
                            <button class="generic-button-dark wide">Users</button>
                        </router-link>
                        <router-link to="/organizer/teamview">
                            <button class="generic-button-dark wide">Teams</button>
                        </router-link>
                        <router-link v-if="user.permissions.reviewer" to="/organizer/review">
                            <button class="generic-button-dark wide">Review</button>
                        </router-link>
                        <router-link to="/organizer/shop">
                          <button class="generic-button-dark wide">Shop</button>
                        </router-link>
<!--                      <router-link to="/organizer/orders">-->
<!--                        <button class="generic-button-dark wide">Orders</button>-->
<!--                      </router-link>-->
                      <router-link to="/organizer/events">
                        <button class="generic-button-dark wide">Events</button>
                      </router-link>
                      <router-link to="/organizer/submissions">
                        <button class="generic-button-dark wide">Submissions</button>
                      </router-link>
                    </div>
                </div>
            </div>
        </div>

        <transition :name="transitionName">
            <router-view class="child-view">

            </router-view>
        </transition>

    </div>
</template>

<script>
    import AuthService from '../AuthService'
    import Session from '../Session'

    export default {
        name: 'Organizer',
        beforeRouteUpdate(to, from, next) {
            const pageLayout = ['statistics', 'users', 'teamview', 'userview', 'teammanage', 'review', 'shop', 'orders', 'events', 'eventview', 'eventusers', 'submissions'];
            const toPath = to.path.split('/');
            const fromPath = from.path.split('/');

            // LoggingService.log('dasd', toPath, fromPath);
            // LoggingService.log('Hello there');

            if (toPath[toPath.length - 1].indexOf('?') != -1) {
                toPath[toPath.length - 1] = toPath[toPath.length - 1].split('?')[0]
            }

            const toDepth = pageLayout.indexOf(toPath[toPath.length - 1]);
            const fromDepth = pageLayout.indexOf(fromPath[toPath.length - 1]);

            // LoggingService.log(toDepth, fromDepth);

            if (toDepth === -1) {
                return next('/organizer/statistics')
            }

            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';

            next()
        },
        data() {
            return {
                user: Session.getUser(),
                loggedIn: Session.loggedIn(),
                AuthService: AuthService,
                transitionName: 'slide-left'
            }
        },
        beforeMount() {
            if (this.$router.currentRoute.path === '/organizer') {
                this.$router.replace('/organizer/statistics')
            }
        }
    }
</script>