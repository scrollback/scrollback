/* jshint browser: true */
/* global $, libsb */

$(function() {
	var $itemTmpl = $(".meta-conf .list-item");
	var currentConfig;

	function renderItem(label) {
		var item = $itemTmpl.clone();
		item.text(label);
		return item;
	}

	function renderSettings(roomId){
		libsb.getRooms({ref: roomId}, function(err, data){
			var results = data.results[0];
			// general settings
			$('.list-view-general-settings #description').val(results.description);
			$('.list-view-general-settings #displayname').val(results.id);

			//irc settings
			if(results.params.irc){
				$('.list-view-irc-settings #ircserver').val(results.params.irc.server);
				$('.list-view-irc-settings #ircchannel').val(results.params.irc.cleint);
			}

			//spam settings
			$('#block-offensive').prop('checked', results.params.wordban);

			//seo settings
			$('#allow-index').prop('checked', results.params.allowSEO);
		});
	}

	$('.meta-conf').click(function(event) {
		// check event.target.closest('.list-item').text()
	});

	$(".configure-button").on("click", function() {
        libsb.emit('navigate', { mode: "conf", source: "configure-button", room: location.pathname.replace('/', '') });
	});

	$(".conf-save").on("click", function() {
		libsb.emit('config-save', {}, function(err, configData){
			console.log(configData);
			var room = {
				id: window.currentState.room,
				description: configData.description,
				identities: '',
				params: {
					irc : {
						channel: configData.irc.channel,
						server: configData.irc.server
					},
					allowSEO: configData.seo,
					wordban: configData.spam.offensive
				}
			};
			libsb.emit('room-up', room, function(){
				currentConfig = null;
        		libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
			});
		});
	});

	$(".conf-cancel").on("click", function() {
		currentConfig = null;
		// $('.settings-menu').empty();
		$('.conf-area').empty();
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-cancel" });
	});

	libsb.on('navigate', function(state, next) {
		// check state.mode == settings
		var sortable = []; // for sorting the config options based on priority
		if(state.mode === "conf"){
			if(currentConfig && state.tab) $('.conf-area').empty().append(currentConfig[state.tab]);
			// if currentConfig is blank, then
			if(!currentConfig){
				libsb.emit('config-show', {},function(err, config) {
					currentConfig = config;

					$('.meta-conf').empty();

					for(i in config) {
						sortable.push([config[i].prio, i, config[i]]);
					}
					sortable.sort(function(a,b){
						return b[0] - a[0];
					});
					sortable.forEach(function(config){
						var className = 'list-item-' + config[1] + '-settings';
						$('.' + className).remove();
						$('.meta-conf').append('<a class="list-item ' + className + '">' + config[2].text + '</a>');
						$('.conf-area').append(config[2].html);
					});
					// making general settings the default tab
					$('.list-item-general-settings').addClass('current');
					$('.list-view-general-settings').addClass('current');

					renderSettings(state.room);
				});
			}
		}
		next();
	});
});
