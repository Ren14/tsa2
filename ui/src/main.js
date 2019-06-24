import Vue from 'vue'
import VueRouter from 'vue-router' 
import App from './App.vue'

Vue.use(VueRouter)
Vue.config.productionTip = false

const router = new VueRouter({
    routes: [
        {
            path: '/'
        },
        {
            path: '/hash/:hash',
            component: App
        }
    ]
});

new Vue({
    router,
    render(h) {
        return h(App, { 
            props: {
                apiurl: this.$el.attributes.apiurl.value,
                timer: this.$el.attributes.timer.value,
            }
        })
    }
}).$mount('#app')