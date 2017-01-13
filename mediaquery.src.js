/*

	Media Query Scope is a library to detect the currently active media queries

	// css example definition
	@media screen { #media-query-scope { z-index: 70; } }
	@media screen and (min-width: 1400px) { #media-query-scope { z-index: 90; } }
	@media screen and (max-width: 980px) { #media-query-scope { z-index: 70; } }
	@media screen and (max-width: 680px) { #media-query-scope { z-index: 40; } }
	@media screen and (max-width: 480px) { #media-query-scope { z-index: 20; } }

	// javascript example initialisation - must be wrapped into a dom ready function
	window.mediaquery = new OCBNET.MediaQuery ({ phone: 10, tablet: 40, default: 70, wide : 90 });
	window.mediaquery = new OCBNET.MediaQuery ({ phone: 10, tablet: 40, desktop: 70, wide : 90 }, 70);

 */

(function() {

	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */

	// constructor (variables/settings and init)
	var MediaQuery = function (identLevels, defaultLevel)
	{
		// configure the media query scopes
		this.identLevels = identLevels || {};
		// check if default level is given explicitly
		if (typeof defaultLevel != 'undefined') {
			// set level for default ident (might be given as ident too)
			this.identLevels['default'] = this.mapToLevel(defaultLevel);
		}
		// assertion that default level has been defined
		// either by ident "default" or given default level
		if (this.identLevels['default'] == 'undefined') {
			// this should be removed for releases, but it catches
			// the most common error when setting up this library!
			throw Error('Missing Default MediaQuery Level')
		}
		// on change event handlers
		this.onChangeHandlers = [];
		// do we listen to resize events
		this.boundResize = false;
		// init dom
		this.init();
	};

	/* @@@@@@@@@@ OCBNET CLASS @@@@@@@@@@ */

	// extend class prototype
	(function()
	{

		// the media query scope id (html/css)
		var mq_id = 'media-query-scope';

		// probe css
		var probe_css =
		{
			'top': '-9999px',
			'left': '-9999px',
			'display': 'block',
			'position': 'absolute'
		};

		// @@@ init @@@
		this.init = function()
		{

			// try to get from document
			if (typeof this.root == 'undefined')
			{
				this.root = jQuery('#' + mq_id);
			}

			// create new one if not found
			if (this.root.length === 0)
			{
				this.root = jQuery('<div/>')
					.attr('id', mq_id)
					.css(probe_css)
					.appendTo('BODY');
			}

			// do we have some context
			if (this.context)
			{
				// now create and add probe
				this.probe = jQuery('<div/>')
					.css(probe_css)
					.addClass(this.context)
					.appendTo(this.root);
			}
			else
			{
				// use root as probe
				this.probe = this.root;
			}

			// remember the currently used level
			this.currentLevel = this.getCurrentLevel();

		}
		// @@@ EO init @@@


		// @@@ mapLevelToIdent @@@
		// level has to be given and known
		this.mapLevelToIdent = function (level)
		{
			// assertion if no argument is given
			if (arguments.length === 0)
			{ throw 'needed level param is not given'; }
			// search for the ident within the object
			for (var ident in this.identLevels)
			{ if (level == this.identLevels[ident]) return ident; }
			// if not returned yet, we did not find the level
			throw 'ident is not defined for level: ' + level;
			// maybe z-index defined in css, but not on constructor
		};
		// @@@ EO mapLevelToIdent @@@


		// @@@ mapIdentToLevel @@@
		// ident has to be given and known
		this.mapIdentToLevel = function (ident)
		{
			// assertion if no argument is given
			if (arguments.length === 0)
			{ throw 'needed ident param is not given'; }
			// assertion that the key is valid
			if (typeof this.identLevels[ident] === 'undefined')
			{ throw 'level is not defined for ident: ' + ident; }
			// return the stored level by ident
			return this.identLevels[ident];
		};
		// @@@ EO mapIdentToLevel @@@

		// @@@ mapToLevel @@@
		// resolve ident or level to level
		this.mapToLevel = function (identOrLevel)
		{
			return isNaN(identOrLevel) ?
				this.mapIdentToLevel(identOrLevel) :
				identOrLevel;
		};
		// @@@ EO mapToLevel @@@

		// @@@ mapToIdent @@@
		// resolve ident or level to ident
		this.mapToIdent = function (identOrLevel)
		{
			return isNaN(identOrLevel) ? identOrLevel :
				this.mapLevelToIdent(identOrLevel);
		};
		// @@@ EO mapToLevel @@@

		// @@@ getLevel @@@
		// convinience method
		this.getLevel = function (identOrLevel)
		{
			// map to current level
			// if no argument is given
			if (arguments.length === 0)
			{ return this.getCurrentLevel(); }
			// ident is given, map to getter
			return this.mapToLevel(identOrLevel);
		};
		// @@@ EO getLevel @@@


		// @@@ getIdent @@@
		this.getIdent = function(identOrLevel)
		{
			// map to current ident
			// if no argument is given
			if (arguments.length === 0)
			{ return this.getCurrentIdent(); }
			// level is given, map to getter
			return this.mapToIdent(identOrLevel);
		};
		// @@@ EO getIdent @@@


		// @@@ getCurrentLevel @@@
		// get level for current body state
		this.getCurrentLevel = function()
		{
			// get the level from context probe
			var level = this.probe.css('z-index');
			// parse number from the style
			if (level && level !== "auto")
			{ return parseInt(level, 10); }
			// get the level from root probe
			level = this.root.css('z-index');
			// parse number from the style
			if (level && level !== "auto")
			{ return parseInt(level, 10); }
			// assertion if not yet returned
			throw 'no z-index set in css';
			// return default level
			return this.identLevels['default'];
		};
		// @@@ EO getCurrentLevel @@@


		// @@@ getCurrentIdent @@@
		// get ident for current body state
		this.getCurrentIdent = function()
		{
			// get level from current body
			var level = this.getCurrentLevel();
			// return mapped ident from level
			return this.mapLevelToIdent(level);
		};
		// @@@ EO getCurrentIdent @@@


		// @@@ is @@@
		// test if we are into a specific state
		// you may use levels or indents as param
		this.is = function (identOrLevel)
		{
			return isNaN(identOrLevel) ?
				this.getCurrentIdent() === identOrLevel :
				this.getCurrentLevel() === identOrLevel ;
		};
		// @@@ EO is @@@

		// @@@ not @@@
		this.not = function (identOrLevel)
		{ return ! this.is(identOrLevel); };
		// @@@ EO not @@@


		// @@@ lt @@@
		// is current state lower than test
		this.lt = function (identOrLevel)
		{
			var level = this.mapToLevel(identOrLevel);
			return this.getCurrentLevel() < level;
		};
		// @@@ EO lt @@@

		// @@@ le @@@
		// is current state lower than or equal test
		this.le = function (identOrLevel)
		{ return ! this.gt(identOrLevel); };
		// @@@ EO le @@@

		// @@@ gt @@@
		// is current state greater than test
		this.gt = function (identOrLevel)
		{
			var level = this.mapToLevel(identOrLevel);
			return this.getCurrentLevel() > level;
		};
		// @@@ EO gt @@@

		// @@@ ge @@@
		// is current state greater than or equal test
		this.ge = function (identOrLevel)
		{ return ! this.lt(identOrLevel); };
		// @@@ EO ge @@@

		// @@@ eq/ne @@@
		// alias to is/not
		this.eq = this.is;
		this.ne = this.not;
		// @@@ EO eq/ne @@@

		// private sorting function
		function priosort(a, b)
		{
			// sort by priority
			return b.prio - a.prio;
		}
		// EO fn priosort

		// private helper function
		function _resized()
		{
			// get previous and current levels
			var prv = this.currentLevel;
			var cur = this.getCurrentLevel();
			// do nothing if they are the same
			if (prv == cur) return true;
			// remember new level on our object
			this.currentLevel = cur;
			// get array with all handlers
			var handlers = this.onChangeHandlers;
			// loop and call all attached event handlers
			for(var i = 0; i < handlers.length; i++)
			{
				handlers[i].call(this, cur, prv);
			}
		}
		// EO fn resized

		// register resized callback
		this.updateLayout = _resized;

		// @@@ EO onChange @@@
		// register change listener
		this.onChange = function (cb, prio)
		{

			// assign priority
			cb.prio = prio || 0;
			// push handler to the array
			this.onChangeHandlers.push(cb)
			// sort the array by cb priority
			this.onChangeHandlers.sort(priosort)

			// attach resize listener only once
			if (!this.boundResize)
			{
				// event handler is registered
				this.boundResize = true;
				// get before next resize event
				this.currentLevel = this.getLevel('default');
				// force callback to the correct context
				var resized = jQuery.proxy(_resized, this);
				// attach resize event handler to the window
				jQuery(self).bind('resize', resized);
				// check if context already has changed
				// if so we will trigger all callback once
				if (this.getCurrentLevel() != this.currentLevel)
				{
					// setup a timer for next idle loop
					// wait till all handlers are collected
					window.setTimeout(resized, 0);
				}
				// EO if level changed
			}
			// EO if not boundResize

		};
		// @@@ EO onChange @@@

	// EO extend class prototype
	}).call(MediaQuery.prototype);

	// make sure our global namespace exists
	// but do not reset it if already present
	if (typeof OCBNET == 'undefined') window.OCBNET = {};

	// assign class to global namespace
	OCBNET.MediaQuery = MediaQuery;

})()