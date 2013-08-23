DomReady.ready(function() {
	navigator.id.watch({
		onlogin: function(assertion) {
			// core.message();
		},
		onlogout: function() {
			
		}
	});
});

Stream.prototype.login = function () {
	navigator.id.request();
};

