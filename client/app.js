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
import { Observable, Subject, Subscription } from 'rxjs';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

// CodeMirror
import "codemirror/lib/codemirror.css";

// Highlight JS
import "highlightjs/styles/github.css";

// Package.json
import pkg from '../package.json';

// Components
import WikiLink from './components/wikiLink.vue';
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

library.add(fab, far, fas);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);

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
        { path: '/', redirect: '/wiki/' },
        { path: '/wiki/:path*', name: 'wiki', component: WikiPage },
        // { path: '*', redirect: '/wiki/' }
    ],
    // scrollBehavior(to, from, savedPosition)
    // {
    //     console.log('sup??');
    //     if(to.hash)
    //     {
    //         return {
    //             selector: to.hash
    //             // , offset: { x: 0, y: 10 }
    //         };
    //     } // ed if
    // }
});

//----------------------------------------------------------------------------------------------------------------------
// Global Components
//----------------------------------------------------------------------------------------------------------------------

Vue.component('wiki-link', WikiLink);

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
