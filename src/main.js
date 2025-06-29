import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.provide('store', store); // 正确注入 store
app.mount('#app');