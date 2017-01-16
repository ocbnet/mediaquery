OCBNET MediaQuery Event Library
===============================

To support responsive web-designs you do not only need have control of your styles, but sometimes
also of your JavaScript. This utility class aims to help you to sync your animation, menu and
other JS behaviors between different breakpoints. To do this you need to be able to reliably listen
to breakpoint change events. There are certainly other modules around that do the same thing. I'm
releasing this library as I have used it in various projects without any issues and wanted to
give it a home here on GitHub for me and others to use if they like to!

## Dependencies

This library has [`jQuery`][1] as a dependency (since I'm lazy)! Pretty much any version should work.

[1]: https://jquery.com/

## Basic Concepts

The basic concept is that you have multiple responsive breakpoints at given window widths. In some
other libraries you must configure these pixel-widths directly in JavaScript, which has quite a
few drawbacks. First you need to keep your CSS media-queries in sync with your JS code. Secondly
this is error prone, since you may define media-queries with inclusive or exclusive borders. Such a
library will do it in one or the other way, and relies on the width it got via JS. So, it
is hard to guarantee that your CSS will use the same breakpoints as you JS lib indicates.

## Coupled to your CSS

To overcome these problems, this library uses the approach to couple breakpoint rules directly
within your CSS. To accomplish this, you need to setup a few CSS media-query rules to describe
your breakpoints. This nicely integrates with most Sass, Less or PostCSS setups, as you simply
need to add a mixin or extend for each existing breakpoint (which are then truly only defined
once). In theory, you can use any selector qualifier for your CSS rules to change the `z-index`
value of the probed element. But changes are only picked up on `resize` events. All CSS rules
that may change on resize (media-queries) are of interest here.

## How does it work

On instantiation, we create one dummy DOM element, the probe node, with the specific ID
`media-query-scope`. The probe node is appended to the body tag (does not really matter where).
The library then registers a `resize` event handler and queries the current `z-index` style
of the probe node on resizes. We could have used pretty much any other CSS property, but
`z-index` fits the bill very well. Now we compare current `z-index` value to the previous
and emit breakpoint change events accordingly.

### CSS Setup with 4 layouts

Below is a simple vanilla CSS example on how to setup the CSS part for this library. Just assign
a number for each viewport state. Under normal circumstances you should be able to link the
ordering of `z-index` numbers to the breakpoints (from lowest to highest). This is only needed
if you want to use the compare operations. It does not influence the equality/is tests.

```css
@media screen { #media-query-scope { z-index: 90; } }
@media screen and (max-width: 980px) { #media-query-scope { z-index: 70; } }
@media screen and (max-width: 680px) { #media-query-scope { z-index: 40; } }
@media screen and (max-width: 480px) { #media-query-scope { z-index: 20; } }
```

It should be obvious how to adopt this to export Sass setups or other preprocessors.

```scss
#media-query-scope {
    z-index: 90; // default
    @include breakpoint(desktop) { z-index: 70; }
    @include breakpoint(tablet) { z-index: 40; }
    @include breakpoint(phone) { z-index: 20; }
}
```

### Create JS event emitter

Now that we described our breakpoints in css, we need to setup the JS part that listens
to browser `resize` events to dispatch media-query changes when occuring. To do this we
need to tell the JS part our `z-index` numbers that we've setup above. For convenience
we assign a name to every breakpoint number. Normally you do this in a DOM ready handler
(i.e. `jQuery.ready`) or before the body closing tag. Make sure you create the shared
event emitter object before you try to register listeners!

```js
// instantiate the media query object
// you probably want to export globally
window.mediaquery =
// configuration must match CSS styles
new OCBNET.MediaQuery ({
    phone: 20,
    tablet: 40,
    desktop: 70,
    wide : 90
}, 'desktop');
```

### Listen to breakpoint changes

Depending on the amount of breakpoints, the handlers can be more or less complex to get
the needed logic right. When there are only two breakpoints, you only need to do one if
check to determine in which state you are. When there are three breakpoints, things can
get a bit more complex. In this case the compare functions can be very handy.

```js
// access the globally created MediaQuery object
mediaquery.onChange(function (current, previous) {
    // get ident string for current level
    var ident = this.getIdent(current);
    // `lt` etc. needs linked ordering
    var small = this.lt('desktop');
    var phone = this.lt('tablet');
})
```

### Initial Change Event

We ensure that change listeners are called when the viewport is initially not at the
default state. This is also the case if you "late" register an event handler. The very
first call for every listener will always get "default" as the previous level ident.
When the UA is loaded with the default viewport, **no** change event is emitted.

### Breakpoint identifier names

Strictly speaking they are not needed and only syntactic sugar. But it is much easier to read
and understand code in the form of `mq.is('desktop')` instead of `mq.is(70)` (both are valid).
This is the only purpose the identifiers serve; as an alias to the numeric values. All compare
functions accept either the numeric level or and ident alias. If you are worried about the
performance, you may want to use the numbers directly to avoid the lookup.

## Functions

```js
var mq = new OCBNET.MediaQuery (...);
```

### Getters

```js
level = mq.getLevel([identOrLevel])
ident = mq.getIdent([identOrLevel])
```

All in one functions with one optional argument. When no argument is given, it returns the
level or ident of the current breakpoint (equivalent of `getCurrentLevel`/`getCurrentIdent`).
When an argument is passed, it will be converted to the corresponding numeric level or
to the ident string (equivalent of `mapToLevel`/`mapToIdent`).

```js
level = mq.mapToLevel(identOrLevel);
ident = mq.mapToIdent(identOrLevel);
ident = mq.mapLevelToIdent(level);
level = mq.mapIdentToLevel(ident);
level = mq.getCurrentLevel() = getLevel();
ident = mq.getCurrentIdent() = getIdent();
```

Various utility functions. It should be obvious how they work and what they do!

### Comparisons

```js
mq.eq(identOrLevel) // is equal
mq.is(identOrLevel) // is equal
mq.ne(identOrLevel) // not equal
mq.not(identOrLevel) // not equal
mq.lt(identOrLevel) // less than
mq.le(identOrLevel) // less or equal
mq.ge(identOrLevel) // greater than
mq.gt(identOrLevel) // greater or equal
```

Compare functions to be used to setup custom responsive JS behavior.

## Performance

This library adds a global `resize` event listener, which is something you should always
consider before adding to your codebase. But it should be obvious that there is no other
way to accomplish this otherwise. I took great care to ensure that this library only fires
as many events as needed. Internally the work done on each `resize` event is minimal. We fetch
the current `z-index` value of our probe element and compare this to the previous stored
state. We emit events when a change is detected. Furthermore, you as developer need to make
sure to use resources reasonably inside the breakpoint change handlers.

### Disable DOM event handlers when not needed

Sometimes you might need a global DOM event handler only at specific breakpoints, i.e. for
closing a mobile menu when the browser window is resized or scrolled. A simple approach would
be to register the global event handlers and then query the breakpoint state in the handlers.
A better approach would be to only have the global event listener active at specific breakpoints.
This can easily be accomplished with this library:

```js
// listen to event only when below desktop
mq.onChange(function (current, previous) {
    // mobile menu below desktop
    if (mq.lt('desktop')) {
        // previous level was at least desktop
        if (previous >= mq.getLevel('desktop')) {
            // ... register event listener
            // hdl = jQuery(window).scroll(...);
        }
    }
    // is desktop or above
    else {
        // previous level was below desktop
        if (previous < mq.getLevel('desktop')) {
            // ... unregister event listener
            // jQuery(window).off('scroll', hdl)
        }
    }
});
```

This only applies to global event handlers that are resource intensive. With click handlers and
other user triggered events it is ok to simply ask the MediaQuery object its current state to
i.e. abort a click handler at certain breakpoints.

```js
// attach click handler for 1st level menu items
jQuery('UL.nav>LI.lvl-0 A').click(function(evt) {
    // bad way to allow hover state
    if (mq.eq('tablet')) {
        // old fashioned abort
        return false;
    }
})
```

## Demo

Resize the browser window to trigger breakpoint events!

 - http://www.ocbnet.ch/github/mediaquery/demo/index.html

Check out the demo sources to get you started:

 - https://github.com/ocbnet/mediaquery/tree/master/demo
 - https://github.com/ocbnet/mediaquery/blob/master/demo/demo.js
 - https://github.com/ocbnet/mediaquery/blob/master/demo/init.js
 - https://github.com/ocbnet/mediaquery/blob/master/demo/styles.css
 - https://github.com/ocbnet/mediaquery/blob/master/demo/index.html