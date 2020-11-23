import vuePlugin from './module/plugin'
import { supportsIntersectionObserver, /*supportsPositionSticky*/ } from './module/helpers'

const awemaPlugin = {

    install() {
        Vue.use(vuePlugin)
        // Array.from(document.querySelectorAll('[data-awema-page-map]')).forEach(el => {
        //     new PageMap(el)
        // })
    }
}

if ( ! supportsIntersectionObserver() ) {
    awemaPlugin.modules['intersection-observer'] = 'https://cdn.jsdelivr.net/npm/intersection-observer-polyfill@0.1.0/dist/IntersectionObserver.global.js'
}

// if ( ! supportsPositionSticky() ) {
//     awemaPlugin.modules['position-sticky'] = 'https://cdnjs.cloudflare.com/ajax/libs/stickyfill/2.1.0/stickyfill.min.js'
// }

if (window && ('AWEMA' in window)) {
    AWEMA.use(awemaPlugin)
} else {
    window.__awema_plugins_stack__ = window.__awema_plugins_stack__ || []
    window.__awema_plugins_stack__.push(awemaPlugin)
}