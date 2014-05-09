/* jshint browser: true */
/* global $, libsb */

$(function() {
	var $tabTmpl = $(".config .tab");
	var currentConfig;

	function renderTab(label) {
		var tab = $tabTmpl.clone();
		tab.text(label);
		return tab;
	}

	function renderSettings(roomId){
		libsb.getRooms({ref: roomId}, function(err, data){
			var results = data.results[0];
			// general settings
			$('.pane-general-settings #description').val(results.description);
			$('.pane-general-settings #displayname').val(results.id);

			//irc settings
			if(results.params.irc){
				$('.pane-irc-settings #ircserver').val(results.params.irc.server);
				$('.pane-irc-settings #ircchannel').val(results.params.irc.cleint);
			}
		
			//spam settings
			$('#block-offensive').prop('checked', results.params.wordban);

			//seo settings
			$('#allow-index').prop('checked', results.params.allowSEO);
		});
	}

	$('.settings-menu').click(function(event) {
		// check event.target.closest('.tab').text()
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
		$('.settings-area').empty();
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-cancel" });
	});

	libsb.on('navigate', function(state, next) {
		// check state.mode == settings
		var sortable = []; // for sorting the config options based on priority 
		if(state.mode === "conf"){
			if(currentConfig && state.tab) $('.settingsview').empty().append(currentConfig[state.tab]);
			// if currentConfig is blank, then
			if(!currentConfig){
				libsb.emit('config-show', {},function(err, config) {
					currentConfig = config;

					for(i in config) {
						sortable.push([config[i].prio, i, config[i]]);
					}   
					sortable.sort(function(a,b){
						return b[0] - a[0];
					});
					sortable.forEach(function(config){
						var className = 'tab-' + config[1] + '-settings';
						$('.' + className).remove();
						$('.settings-menu ul').append('<li class = "tab ' + className + '">' + config[2].text + '</li>');
						$('.settings-area').append(config[2].html);
					});
					// making general settings the default tab
					$('.tab-general-settings').addClass('current');
					$('.pane-general-settings').addClass('current');

					renderSettings(state.room);
				});
			}
		}
		next();
	});
});
