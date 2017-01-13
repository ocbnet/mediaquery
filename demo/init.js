// you would normaly wrap this in a
// dom ready handler (i.e jQuery(fn))
(function() {
	// instantiate the media query object
	// you probably want to export globally
	window.mediaquery =
	// configuration must match css styles
	new OCBNET.MediaQuery ({
		phone: 20,
		tablet: 40,
		desktop: 70,
		wide : 90
	}, 'desktop');

})();
