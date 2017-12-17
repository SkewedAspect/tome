//----------------------------------------------------------------------------------------------------------------------
// Main Client-side Application
//
// @module
//----------------------------------------------------------------------------------------------------------------------

// Overwrite the global promise with Bluebird. This makes `axios` use Bluebird promises.
import Promise from 'bluebird';
window.Promise = Promise;

//----------------------------------------------------------------------------------------------------------------------

import Vue from 'vue';
import VueRouter from 'vue-router';
import BootstrapVue from 'bootstrap-vue'

// VueRX
import VueRx from 'vue-rx'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

// Font Awesome
import fontawesome from '@fortawesome/fontawesome'
import faBrands from '@fortawesome/fontawesome-free-brands'
import faSolid from '@fortawesome/fontawesome-pro-solid'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

import pkg from '../package.json';

// Views
import AppComponent from './app.vue';

// Pages
import WikiPage from './pages/wiki/wiki.vue';

// ---------------------------------------------------------------------------------------------------------------------
// VueRX
// ---------------------------------------------------------------------------------------------------------------------

Vue.use(VueRx, {
    Observable,
    Subscription,
    Subject
});

// ---------------------------------------------------------------------------------------------------------------------
// Font Awesome
// ---------------------------------------------------------------------------------------------------------------------

fontawesome.library.add(faBrands, faSolid);
Vue.component(FontAwesomeIcon.name, FontAwesomeIcon);

// ---------------------------------------------------------------------------------------------------------------------
// Bootstrap Vue
// ---------------------------------------------------------------------------------------------------------------------

import './scss/theme.scss';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);


//----------------------------------------------------------------------------------------------------------------------
// Vue Router
//----------------------------------------------------------------------------------------------------------------------

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', redirect: '/wiki' },
        { path: '/wiki', component: WikiPage },
        { path: '/wiki/*', component: WikiPage },
        { path: '/auth/logout', redirect: '/wiki' }
    ]
});

//----------------------------------------------------------------------------------------------------------------------
// App Setup
//----------------------------------------------------------------------------------------------------------------------

Vue.config.debug = true;

const App = Vue.component('app', AppComponent);
const app = new App({
    el: '#tome-app',
    router,
});

// ---------------------------------------------------------------------------------------------------------------------
// Version information
// ---------------------------------------------------------------------------------------------------------------------

window.TOME = {
    version: pkg.version
};

// ---------------------------------------------------------------------------------------------------------------------
