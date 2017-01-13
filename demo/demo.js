// you would normaly wrap this in a
// dom ready handler (i.e jQuery(fn))
(function() {
	// prefetch the status DOM element
	var info = document.getElementById('info');
	// access shared mediaquery instance
	var mq = window.mediaquery;
	// register onChange listener
	 mq.onChange(function (cur, prv) {
		// create status report
		var html = [
			"time: " + (new Date()).getTime(),
			"ident: " + mq.getIdent(),
			"level: " + mq.getLevel(),
			"is phone: " + mq.is("phone"),
			"is tablet: " + mq.is("tablet"),
			"is desktop: " + mq.is("desktop"),
			"is wide: " + mq.is("wide"),
			"is == 40: " + mq.eq(40),
			"is != 40: " + mq.ne(40),
			"is < 40: " + mq.lt(40),
			"is <= 40: " + mq.le(40),
			"is >= 40: " + mq.ge(40),
			"is > 40: " + mq.gt(40),
			"cur: " + cur,
			"prv: " + prv
		].join("<br>");
		// update the document
		info.innerHTML = html;
	})

})();
