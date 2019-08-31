import Vue from 'vue'
import Router from 'vue-router'
import vSelect from 'vue-select'
import Session from './Session'
import AuthService from './AuthService'

import 'vue-select/dist/vue-select.css';

import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Reset from './views/Reset.vue'
import Verify from './views/Verify.vue'

import Dashboard from './views/Dashboard.vue'
import Organizer from './views/Organizer.vue'
import Owner from './views/Owner.vue'
import Developer from './views/Developer.vue'
import Checkin from './views/Checkin.vue'
import Statistics from './views/Statistics.vue'
import Users from './views/Users.vue'
import Application from './views/Application.vue'
import Team from './views/Team.vue'
import Confirmation from './views/Confirmation.vue'
import Error from './views/Error.vue'
import PasswordChange from './views/PasswordChange.vue'
import Review from './views/Review.vue'
import UserView from './views/UserView.vue'
import TeamTable from './views/TeamTable.vue'
import MagicLogin from './views/Magic.vue'
import TeamManage from './views/AdminTeamView.vue'
import Swal from 'sweetalert2'
import axios from 'axios'
import {apiHost} from "./variables";

Vue.use(Router);

Vue.use(require('vue-moment'));
Vue.component('v-select', vSelect);

axios.get(apiHost + '/api/settings').then(result => {
  Session.setSettings(result.data)
}).catch(() => console.log("wow this should never have failed!"));

// Refresh every 24HRs
setInterval(() => {
  AuthService.refreshToken()
}, 86400000);

AuthService.refreshToken();

function requireAuth (to, from, next) {
  if (!Session.loggedIn()) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  } else {
    next()
  }
}

function isAuthorized (to, from, next) {
  var authorized = true;

  for (var key in to.meta) {
    if (!Session.getUser() || !to['meta'][key] in Session.getUser()[key] || !Session.getUser()[key][to['meta'][key]]) {
      authorized = false;
      break
    }
  }

  if (authorized) {
    next()
  } else if (!Session.loggedIn()) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  } else {
    next({
      path: '/error',
      query: {
        error: 'You don\'t have permission to access this page.'
      }
    })
  }

}

const router = new Router({
  mode: 'history',
  base: __dirname,
  routes: [
    {
      path: '/',
      beforeEnter (to, from, next) {
        if (Session.loggedIn()) {
          next('/dashboard')
        } else {
          next('/login')
        }
      }
    },
    {
      path: '/magic',
      component: MagicLogin
    },
    {
      path: '/dashboard',
      component: Dashboard,
      beforeEnter: requireAuth
    },
    {
      path: '/password',
      component: PasswordChange,
      beforeEnter: requireAuth
    },
    {
      path: '/application',
      component: Application,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'verified'
      }
    },
    {
      path: '/team',
      component: Team,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'verified'
      }
    },
    {
      path: '/confirmation',
      component: Confirmation,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'verified',
        status: 'admitted'
      }
    },
    {
      path: '/checkin',
      component: Checkin,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'checkin'
      }
    },
    {
      path: '/organizer',
      component: Organizer,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'admin'
      },
      children: [
        {
          path: 'statistics',
          component: Statistics,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'admin'
          }
        },
        {
          path: 'users',
          component: Users,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'admin'
          }
        },
        {
          path: 'review',
          component: Review,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'reviewer'
          }
        },
        {
          path: 'review',
          component: Review,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'reviewer'
          }
        },
        {
          path: 'userview',
          component: UserView,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'admin'
          }
        },
        {
          path: 'teamview',
          component: TeamTable,
          beforeEnter: isAuthorized,
          meta: {
            permissions: 'admin'
          }
        },
        {
          path: 'teammanage',
          component: TeamManage,
          beforeEnter: isAuthorized,
          meta: {
            permissions: "admin"
          }
        }
      ]
    },
    {
      path: '/owner',
      component: Owner,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'owner'
      }
    },
    {
      path: '/developer',
      component: Developer,
      beforeEnter: isAuthorized,
      meta: {
        permissions: 'developer'
      }
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/logout',
      beforeEnter (to, from, next) {
        Swal.fire({
          title: 'Just to be safe',
          text: 'Are you sure you want to logout?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Logout'
        }).then(result => {
          if (result.value) {
            AuthService.logout(null, 'You have been logged out');
            window.location.replace("/login?message=You have been logged out")
          }
        })
      }
    },
    {
      path: '/verify/:token',
      component: Verify,
      props: true
    },
    {
      path: '/reset/:token',
      component: Reset,
      props: true
    },
    {
      path: '/reset',
      component: Reset
    },
    {
      path: '/error',
      component: Error
    },
    {
      path: '*',
      beforeEnter (to, from, next) {
        next({
          path: '/error',
          query: {
            error: 'Page not found.'
          }
        })
      }
    }
  ]
});
// export default new Router({
//   mode: 'history',
//   base: process.env.BASE_URL,
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: Home
//     },
//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (about.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
//     }
//   ]
// })
/*
router.beforeEach((to, from, next) => {

  const mainLayout = ['dashboard', 'application', 'team', 'confirmation', 'checkin', 'organizer', 'owner', 'developer', 'password', 'logout'];
  const loginLayout = ['login', 'register', 'reset'];

  const toPath = to.path.split('/');
  const fromPath = from.path.split('/');

  let pageLayout = Session.loggedIn() ? mainLayout : loginLayout;

  console.log(fromPath, toPath);

  const toDepth = pageLayout.indexOf(toPath[1]);
  const fromDepth = pageLayout.indexOf(fromPath[1]);

  // Kind of ghetto way to transfer data
  // Couldn't find better way to detect router update :'(

  console.log("sgsafgsf");
  console.log(this);
  if (Session.loggedIn()) {
    if (mainLayout.indexOf(fromPath[1]) != -1 || Session.loggedIn()) {
      vue.transition = toDepth > fromDepth ? 'slide-up' : 'slide-down'
    } else {
      vue.transition = toDepth > fromDepth ? 'slide-left' : 'slide-right'
    }
  } else {
    vue.transition = ''
  }

  next()
});*/

export default router;