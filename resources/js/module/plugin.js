import pageMap from '../../vue/page-map.vue'

export function install(Vue) {

    if (this.installed) return
    this.installed = true

    Vue.component('page-map', pageMap)
}

export default {
    installed: false,
    install
}
