/* global $ */

var $spinnerEl;

function resolveEl(source) {
	var $buttonEl;
	switch (source) {
		case 'facebook':
			$buttonEl = $('.js-cordova-fb-login');
			break;
		case 'google':
			$buttonEl = $('.js-cordova-google-login');
			break;
	}
	return $buttonEl;
}

module.exports = {
	spin: function(source) {
		$spinnerEl = resolveEl(source);
		$spinnerEl.addClass('loading');
	},
	stop: function(source) {
		$spinnerEl = resolveEl(source);
		$spinnerEl.removeClass('loading');
	}
};	