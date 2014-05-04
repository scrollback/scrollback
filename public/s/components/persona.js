(function(){
	function hidePopOver() {
		$(".popover-body").removeClass().addClass("popover-body").empty();
		$(".layer").remove();
	}

	$(document).on("click", ".button.persona", function() {
		navigator.id.watch({
			onlogin: function(assertion){
				var action = {};
				action.auth = {
					browserid: assertion
				};
				libsb.emit("init-up", action, function(err, data) {});	
			},
			onlogout: function() {
				// will get there soon enough.
			}
		});
		navigator.id.request();
		hidePopOver();
	});
})();