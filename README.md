OCBNET MediaQuery Event Library
===============================

To support responsive web-designs you do not only need have control of your styles, but sometimes
also of your JavaScript. This utility class aims to help you to sync your animation, menu and
other JS behaviors between different breakpoints. To do this you need to be able to reliably listen
to breakpoint change events. There are certainly other modules around that do the same thing. I'm
releasing this library as I have used it in various projects without any issues and wanted to
give it a home here on GitHub for me and others to use if they like to!

This library has jQuery as a dependency (since I'm lazy)!

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
value of the probed element. But changes are only picked up on resize events. All CSS rules
that may change on resize (media-queries) are of interest here.

## How does it work

On instantiation, we create one dummy DOM element with the specific ID `media-query-scope`. The
library registers a resize event handler and queries the current `z-index` style. We could have
used pretty much any other CSS property, but `z-index` fits the bill very well.

### Sample Setup with 4 layouts

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

### Instantiate the singleton

You would normally wrap this in a DOM ready handler (i.e. `jQuery.ready`).
Just make sure you create the shared object before you try to use it!

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

```js
// access the globally created MediaQuery object
mediaquery.onChange(function (current, previous) {
    // get ident string for current level
    var ident = this.getIdent(current);
    // `lt` etc. needs linked ordering
    var small = this.lt('desktop');
})
```

### Initial Change Event

We ensure that every change listener is called when the viewport changes from default.
This is also the case if you "late" register an event handler. The very first call
for every listener will therefore always have "default" as the previous level ident.
When the UA is loaded with the default viewport, **no** change event is emitted!

### Identifiers

Strictly speaking they are not needed and only syntactic sugar. But it is much easier to
read and understand code in the form of `mq.is('desktop')` instead of `mq.is(70)` (both
are valid). This is the only purpose the identifiers serve; as an alias to the numeric
values. All compare functions accept either the numeric level or and ident alias.

## Functions

```js
var mq = new OCBNET.MediaQuery (...);
```

### Getters

```js
level = mq.getLevel([identOrLevel])
ident = mq.getIdent([identOrLevel])
```

Input argument is optional. If none is given it returns the level/ident of the current
breakpoint (equivalent of `getCurrentLevel`/`getCurrentIdent`). Otherwise it maps the input
to the numeric level/ident string (equivalent of `mapToLevel`/`mapToIdent`).

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
eq(identOrLevel) // is equal
is(identOrLevel) // is equal
ne(identOrLevel) // not equal
not(identOrLevel) // not equal
lt(identOrLevel) // less than
le(identOrLevel) // less or equal
ge(identOrLevel) // greater than
gt(identOrLevel) // greater or equal
```

Compare functions to be used to setup custom responsive JS behavior.

## Performance

This library adds a global scroll event listener, which is something you should always consider
before adding to your codebase. But it should be obvious that there is no other way to accomplish
a media-query event library otherwise. I took great care to ensure that this library only fires
as many events as needed. Furthermore, you as developer can make sure to use resources wisely.

### Disable DOM event handlers when not needed

Sometimes you may need certain DOM event handler only on specific breakpoints, i.e. closing a mobile
menu when the browser is resized. To optimize performance this can easily be accomplished by
registering/unregistering event handlers when needed on certain breakpoint events:

```js
// listen to event only when below desktop
mq.onChange(function (current, previous) {
    // mobile menu below desktop
    if (mq.lt('desktop')) {
        // previous level was at least desktop
        if (previous >= mq.getLevel('desktop')) {
            // ... register event listener
        }
    }
    // is desktop or above
    else {
        // previous level was below desktop
        if (previous < mq.getLevel('desktop')) {
            // ... unregister event listener
        }
    }
});
```

In click handlers or other rarely triggered events it should be ok to simply ask the MediaQuery
object its current state to i.e. abort a click handler on certain breakpoints.

## Demo

Resize the browser window to trigger breakpoint events!

 - http://www.ocbnet.ch/github/mediaquery/demo/index.html
