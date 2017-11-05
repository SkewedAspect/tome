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
import VueMaterial from 'vue-material';
import VueRouter from 'vue-router';

import pkg from '../package.json';

// Views
import AppComponent from './app.vue';

// Pages
import WikiPage from './pages/wiki/wiki.vue';
import SettingsPage from './pages/settings.vue';

// ---------------------------------------------------------------------------------------------------------------------
// Vue Material
// ---------------------------------------------------------------------------------------------------------------------

Vue.use(VueMaterial);

Vue.material.registerTheme({
    default: {
        primary: {
            color: 'light-blue',
            hue: 800
        },
        accent: 'purple'
    },
    secondary: {
        primary: {
            color: 'light-blue',
            hue: 500
        },
        accent: 'purple'
    },
    settings: {
        primary: 'grey',
        accent: 'blue'
    }
});

Vue.material.setCurrentTheme('default');

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
        { path: '/settings', component: SettingsPage },
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
