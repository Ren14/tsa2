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
                lb_00: this.$el.attributes.lb_00.value,
                lb_01: this.$el.attributes.lb_01.value,
                lb_02: this.$el.attributes.lb_02.value,
                lb_03: this.$el.attributes.lb_03.value,
                lb_04: this.$el.attributes.lb_04.value,
                lb_05: this.$el.attributes.lb_05.value,
                lb_06: this.$el.attributes.lb_06.value,
                lb_07: this.$el.attributes.lb_07.value,
                lb_08: this.$el.attributes.lb_08.value,
                lb_09: this.$el.attributes.lb_09.value,
                lb_10: this.$el.attributes.lb_10.value,
                lb_11: this.$el.attributes.lb_11.value,
                lb_12: this.$el.attributes.lb_12.value,
                lb_13: this.$el.attributes.lb_13.value,
                lb_14: this.$el.attributes.lb_14.value,            
                lb_15: this.$el.attributes.lb_15.value,            
                lb_16: this.$el.attributes.lb_16.value,            
                lb_17: this.$el.attributes.lb_17.value,            
                lb_18: this.$el.attributes.lb_18.value,            
                lb_19: this.$el.attributes.lb_19.value,            
                lb_20: this.$el.attributes.lb_20.value,            
                lb_21: this.$el.attributes.lb_21.value,
                lb_22: this.$el.attributes.lb_22.value,
            }
        })
    }
}).$mount('#app')
