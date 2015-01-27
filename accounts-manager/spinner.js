/* global $ */

var $spinnerEl = $('#spinner');

module.exports = {
    spin: function() {
        $spinnerEl.addClass('spinner');
    },
    stop: function() {
        $spinnerEl.removeClass('spinner');
    }
};
