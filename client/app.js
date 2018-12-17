//----------------------------------------------------------------------------------------------------------------------
// Main Client-side Application
//----------------------------------------------------------------------------------------------------------------------

// Overwrite the global promise with Bluebird. This makes `axios` use Bluebird promises.
import Promise from 'bluebird';
window.Promise = Promise;

//----------------------------------------------------------------------------------------------------------------------

import Vue from 'vue';
import VueRouter from 'vue-router';
import BootstrapVue from 'bootstrap-vue';

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
import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/merge/merge.js';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/meta';

// Highlight JS
import "highlightjs/styles/github.css";

// Package.json
import pkg from '../package.json';

// Components
import WikiLink from './components/wiki/link.vue';
import AppComponent from './app.vue';

// Pages
import CommentPage from './pages/comment.vue';
import HistoryPage from './pages/history.vue';
import SearchPage from './pages/search.vue';
import WikiPage from './pages/wiki.vue';

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
        { path: '/search', name: 'search', component: SearchPage },
        { path: '/comment/:path*', name: 'comments', component: CommentPage },
        { path: '/history/:path*', name: 'history', component: HistoryPage },
        { path: '/wiki/:path*', name: 'wiki', component: WikiPage },
    ],
    // scrollBehavior(to, from, savedPosition)
    // {
    //     console.log('sup??');
    //
    //     if(savedPosition)
    //     {
    //         return savedPosition;
    //     } // end if
    //
    //     if(to.hash)
    //     {
    //         return { selector: to.hash };
    //     } // end if
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
