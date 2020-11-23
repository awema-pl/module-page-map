import {
    getOffsetTop,
    getInnerWidth,
    supportsPassiveListener
} from '../module/helpers'

export default {

    props: {

        sticky: {
            type: [Object, Boolean],
            default: () => ({ top: 10 })
        }
    },


    data() {
        return {
            shouldStick: false,
            sizes: {
                width: null,
                height: null
            }
        }
    },


    computed: {

        stickyTop() {
            return this.sticky && Number(this.sticky.top) || 0
        },

        stickyBottom() {
            return this.sticky && Number(this.sticky.bottom) || 0
        },

        stickyStyle() {
            if (!this.shouldStick) return null
            let fixed = this.shouldStick === 'top'
            return {
                position: fixed ? 'fixed' : 'absolute',
                top: fixed ? this.stickyTop + 'px' : 'auto',
                bottom: fixed ? 'auto' : this.stickyBottom + 'px',
                width: this.sizes.width + 'px',
                maxHeight: fixed ? this.sizes.height + 'px' : null,
                overflow: 'auto'
            }
        },

        stickyClass() {
            return this.shouldStick ? 'is-sticky-' + this.shouldStick : null
        },

        passive() {
            return this._isMounted && supportsPassiveListener() ?
                    { passive: true } : 
                    false 
        }
    },


    methods: {

        prepareSticky() {
            let parent = this.$el.parentNode
            let parentTop = getOffsetTop(parent)
            let parentHeight = parent.clientHeight
            let elHeight = this.$el.offsetHeight
            let canStick = parentHeight > elHeight
            if ( canStick ) {
                window.addEventListener('scroll', this.checkSticky, this.passive )
                this.__stickAt = parentTop - this.stickyTop
                this.__stickBottomAt = parentTop + parentHeight - elHeight- this.stickyTop - this.stickyBottom
                this.sizes = {
                    width: getInnerWidth(parent),
                    height: window.innerHeight - this.stickyTop - this.stickyBottom
                }
            } else {
                window.removeEventListener('scroll', this.checkSticky, this.passive )
                this.shouldStick = false
            }
            return canStick
        },

        checkSticky() {
            let top = window.pageYOffset
            if (top <= this.__stickAt) {
                this.shouldStick = false
                return
            }
            if (top <= this.__stickBottomAt && this.__stickAt < top) {
                this.shouldStick = 'top'
            } else {
                this.shouldStick = 'bottom'
            }
        },

        updateSticky() {
            this.prepareSticky() && this.checkSticky()
        }
    },


    mounted() {
        if (this.sticky) {
            this.__oldParentPosition = getComputedStyle(this.$el.parentNode).position
            if (this.__oldParentPosition === 'static') this.$el.parentNode.style.position = 'relative'
            this.updateSticky()
            window.addEventListener('resize', this.updateSticky)
        }
    },


    beforeDestroy() {
        if (this.sticky) {
            if (this.__oldParentPosition === 'static') this.$el.parentNode.style.position = null
            window.removeEventListener('scroll', this.checkSticky, this.passive )
            window.removeEventListener('resize', this.updateSticky)
        }
    }
}