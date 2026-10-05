import { mount } from 'svelte'
import App from './App.svelte'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './app.css'

const target = document.getElementById('app')
if (!target) throw new Error('#app container missing from index.html')

export default mount(App, { target })
