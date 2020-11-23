<template>
    <nav class="page-map" :style="stickyStyle" :class="stickyClass">
        <slot name="before"></slot>
        <ul class="page-map__list" v-if="targetsEls && targetsEls.length">
            <li
                v-for="(target, i) in targetsEls"
                :key="i"
                class="page-map__list-item"
                :class="[`for-${target.tagName.toLowerCase()}`, {'is-active': activeAnchor == i}]"
            >
                <a
                    class="page-map__link" :href="`#${target.id}`"
                    @click.prevent="scrollToAnchor(i)"
                >
                    {{ target.innerText }}
                </a>
            </li>
        </ul>
        <slot name="after"></slot>
    </nav>
</template>

<script>
import {
    getOffsetTop,
    scrollToPosition,
    removeLocationHash,
    innerWrap
} from '../js/module/helpers'

import stickyMixin from '../js/mixins/sticky'

export default {

    name: 'page-map',

    mixins: [ stickyMixin ],


    props: {

        content: {
            type: String,
            default: 'body'
        },

        exclude: String,

        targets: {
            type: String,
            default: 'h1, h2, h3, h4, h5, h6'
        },

        offset: {
            type: Number,
            default: 0
        }
    },


    data() {
        return {
            contentEl: null,
            activeAnchor: null,
            targetsEls: [],
            targetsHeights: []
        }
    },


    watch: {

        content(newContent, oldContent) {
            if ( oldContent &&
                    document.querySelector(oldContent) === this.contentEl ) return
            if ( oldContent ) this.destroy()
            if ( newContent ) this.init()
        }
    },


    methods: {

        scrollToAnchor(i) {
            this.toggleScrollListener(false)
            this.setActiveAnchor(i)
            scrollToPosition(this.targetsHeights[i] + this.offset )
                .then( () => {
                    this.toggleScrollListener(true)
                })
        },

        setTargetsHeights() {
            this.targetsHeights = Array.from(this.targetsEls).map( el => {
                return getOffsetTop(el)
            })
        },

        checkActiveAnchor() {
            let i = 0, height = window.pageYOffset
            while (i < this.targetsHeights.length - 1 && height > this.targetsHeights[i]) {
                i += 1
            }
            this.setActiveAnchor(i)
        },

        setActiveAnchor(index) {
            if ( index === this.activeAnchor ) return
            this.activeAnchor = index
            if ( index === null ) {
                removeLocationHash()
            } else {
                history.replaceState(undefined, undefined, `#${this.targetsEls[index].id}`)
            }
        },

        toggleScrollListener(isActive) {
            window[isActive ? 'addEventListener' : 'removeEventListener']('scroll', this.checkActiveAnchor)
        },

        createAnchors() {
            if ( ! this.contentEl ) return false
            let targetsEls = this.contentEl.querySelectorAll(this.targets)
            if ( ! targetsEls ) return false
            if ( this.exclude ) {
                let excludeEls = this.contentEl.querySelectorAll(this.exclude)
                if ( excludeEls ) {
                    excludeEls = Array.from(excludeEls)
                    targetsEls = Array.from(targetsEls).filter( el => {
                        return ! excludeEls.includes(el) && ! excludeEls.find( excEl => excEl.contains(el))
                    })
                }
            }
            for ( let i = 0; i < targetsEls.length; i++) {
                let heading = targetsEls[i]
                heading.id = heading.id || this.$url.urlify(heading.innerText)
                let anchor = innerWrap(targetsEls[i], 'A', {href: '#' + heading.id, class: 'page-map-anchor'})
                anchor.addEventListener('click', (e) => { 
                    e.preventDefault();
                    this.scrollToAnchor(i)
                }, true)
            }
            if ( ! targetsEls.length ) return false
            this.targetsEls = targetsEls
            this.setTargetsHeights()
            this.checkActiveAnchor()
            return true
        },

        globalObserver(mutations) {
            let nonContent = mutations.filter( mutation => {
                return ! this.contentEl.contains(mutation.target)
            })
            if ( nonContent.length ) setTimeout(this.setTargetsHeights, 0)
            // use method from sticky-mixin
            if ( this.sticky ) this.updateSticky()
        },

        createObservers() {
            this.__intersectionObserver = new IntersectionObserver( entries => {
                let entry = entries[0]
                if ( entry.intersectionRatio /* polifill has no `isIntersecting` property */ ) {
                    // this.setActiveAnchor(entry.intersectionRatio < .5 ? 0 : this.targetsEls.length - 1)
                    this.toggleScrollListener(true)
                } else {
                    this.toggleScrollListener(false)
                    this.setActiveAnchor(null)
                }
            })
            this.__intersectionObserver.observe(this.contentEl)

            try {
                this.__globalMutationObserver = new MutationObserver(this.globalObserver)
                this.__globalMutationObserver.observe(document.body, {childList: true, subtree: true})
            } catch (e) {
                if ( AWEMA_CONFIG.dev ) console.log('page-map: ', e);
            }
        },

        init() {
            this.contentEl = document.querySelector(this.content)
            let hasAnchors = this.createAnchors()
            if ( hasAnchors ) {
                this.createObservers()
                window.addEventListener('resize', this.setTargetsHeights)
            }
        },

        destroy() {
            window.removeEventListener('resize', this.setTargetsHeights)
            try {
                this.__intersectionObserver.disconnect()
                this.__globalMutationObserver.disconnect()
            } catch (e) {
                if ( AWEMA_CONFIG.dev ) console.log('page-map: ', e);
            }
        }
    },


    mounted() {
        this.init()
    },


    beforeDestroy() {
        this.destroy()
    }
}
</script>