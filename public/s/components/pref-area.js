/* jshint browser: true */
/* global $, libsb */

$(function() {
	var $itemTmpl = $(".meta-pref .list-item");
	var currentConfig;

	function renderItem(label) {
		var item = $itemTmpl.clone();
		item.text(label);
		return item;
	}

	function renderSettings(userId){
		libsb.getUsers({ref: userId}, function(err, data){
			var results = data.results[0];
			var radio = {"daily": 0, "weekly": 1, "never": 2};

			// user profile
			$('#about-me').val(results.description);

			//email
			if(results.params && results.params.email){
				$('input:radio[name="email-freq"]').eq(radio[results.params.email.frequency]).prop('checked' , 'true');
				$('.list-view-email-settings #mention').prop('checked', results.params.email.notifications);
			}

			//notifications
			if(results.params && results.params.notifications){
				$('#sound-notification').prop('checked', results.params.notifications.sound);
				$('#desktop-notification').prop('checked', results.params.notifications.desktop);
			}

		});
	}

	$(".conf-save").on("click", function() {
		libsb.emit('pref-save', {}, function(err, configData){
			var user = {
				id: libsb.user.id,
				description: configData.aboutMe,
				params: {
					email : configData.email,
					notifications: configData.notifications
				}
			};

			libsb.emit('user-up', user, function(err, data){
				currentConfig = null;
        		libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
			});
		});
	});

	$(".conf-cancel").on("click", function() {
		currentConfig = null;
		$('.pref-area').empty();
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-cancel" });
	});

	libsb.on('navigate', function(state, next) {
		// check state.mode == settings
		var sortable = []; // for sorting the config options based on priority

		if(state.mode === "pref"){
			if(currentConfig && state.tab) $('.pref-area').empty().append(currentConfig[state.tab]);

			// if currentConfig is blank, then
			if(!currentConfig){
				libsb.emit('pref-show', {},function(err, config) {
					currentConfig = config;

					$('.meta-pref').empty();

					sortable = [];

					for(i in config) {
						sortable.push([config[i].prio, i, config[i]]);
					}

					sortable.sort(function(a,b){
						return b[0] - a[0];
					});

					sortable.forEach(function(config){
						var className = 'list-item-' + config[1] + '-settings';
						$('.' + className).remove();
						$('.meta-pref').append('<a class="list-item ' + className + '">' + config[2].text + '</a>');
						$('.pref-area').append(config[2].html);
					});

					// making profile settings the default list-item
					$('.list-item-profile-settings').addClass('current');
					$('.list-view-profile-settings').addClass('current');

					renderSettings(libsb.user.id);

					$('#desktop-notification').change(function(){
						if($(this).is(':checked')){
							lace.notify.request();
							var laceObj = lace.notify.support();
							if(laceObj.permission === "denied"){
								lace.alert.show("error", "Permission for desktop notifcations denied!");
							}
						}
					});
				});
			}
		}
		next();
	});
});
