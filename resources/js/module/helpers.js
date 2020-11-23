export function getOffsetTop(el) {
    let top = 0
    do {
        top += el.offsetTop
        el = el.offsetParent
    } while (el)
    return top
}

export function getInnerWidth(el) {
    let style = getComputedStyle(el)
    return el.clientWidth - parseInt(style.paddingLeft) - parseInt(style.paddingRight)
}

export function easeOutCubic(t) {
    return (--t) * t * t + 1
}

export function scrollToPosition( position, duration = 700 ) {

    let startTime = new Date().getTime()
    let startPos = window.pageYOffset
    let distance = position - startPos

    return new Promise( resolve => {

        function scroll() {
            let time = new Date().getTime() - startTime
            if ( time < duration ) {
                let currentPos = startPos + distance * easeOutCubic(time/duration)
                window.scrollTo(0, currentPos)
                requestAnimationFrame(scroll)
            } else {
                window.scrollTo(0, position)
                requestAnimationFrame(resolve)
            }
        }

        requestAnimationFrame(scroll)

    })
}

export function removeLocationHash() {
    history.replaceState(undefined, undefined, location.href.split('#')[0])
}

export function innerWrap(el, tag, attrs) {
    tag = document.createElement(tag)
    el.appendChild(tag)
    if ( attrs ) {
        Object.keys(attrs).forEach( attr => {
            tag.setAttribute(attr, attrs[attr])
        })
    }
    Array.from(el.childNodes).forEach(el => {
        if (el === tag) return
        tag.appendChild(el)
    })
    return tag
}

export function supportsIntersectionObserver() {
    try {
        let ob = new IntersectionObserver(function () { })
        ob.disconnect()
        return true
    } catch (e) {
        return false
    }
}

export function supportsPositionSticky() {
    const el = document.createElement('a'), mStyle = el.style;
    mStyle.cssText = "position:sticky;position:-webkit-sticky;position:-ms-sticky;";
    return mStyle.position.indexOf('sticky') !== -1;
}

export function supportsPassiveListener() {
    let supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get() { supportsPassive = true }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) { }
    return supportsPassive
}