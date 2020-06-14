import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import StandardTable from './components/standard-table'

Vue.use(Antd)
Vue.use(StandardTable, {
  responseItems: 'data.data.items',
  responseTotal: 'data.data.total',
  pageSize: 15,
  pageSizes: ['10', '15', '20', '50', '100'],
  defaultTableOptions: {
    bordered: true
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
