/* jshint browser: true */
/* global $, libsb, lace, currentState */

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
				if(results.params.irc.pending) {
					$.get('/r/irc/' + results.id, function(botName) {
						var displayString = "The IRC channel operator needs to type \"/msg " + botName + " connect " + results.params.irc.channel + " " + results.id + "\" in the irc channel.";
						$('#roomAllowed').text(displayString);
					});
				} else if (results.params.irc.channel && results.params.irc.channel.length) {
					$('#roomAllowed').text("Connected to irc channel: " + results.params.irc.channel);
				} else {
					$('#roomAllowed').text("Not connected to any channel :(");
				}

				$('.list-view-irc-settings #ircserver').val(results.params.irc.server);
				$('.list-view-irc-settings #ircchannel').val(results.params.irc.channel);
			}
			//twitter setting
			if (!results.params.twitter) results.params.twitter = {};
                        var twitter = results.params.twitter;

                        if (twitter.username) {
                                $('#twitter-text').text("Twitter Account: " + twitter.username);
                                $("#twitter-account").text("Change");
                        } else {
                                $('#twitter-text').text("Not signed in");
                                $("#twitter-account").text("Sign in");
                                $("#twitter-message").text("Please sign in to twitter to watch hashtags.");
                        }

                        if (twitter.tags) {
                                lace.multientry.add($("#twitter-hashtags"), twitter.tags);
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
		if(currentState.mode == 'conf'){
			libsb.emit('config-save', {id: window.currentState.room, description: '', identities: [], params: {}}, function(err, room){
				console.log("REvieved room setting ", room);                                
                                var roomObj = {type: 'room', to: currentState.room, id: generate.uid(), room: room, user: {id: libsb.user}};
				libsb.emit('room-up', roomObj, function(){
					currentConfig = null;
                                        $('.conf-area').empty();
	        		        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
				});
			});
		}
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
                                libsb.getRooms({ref: currentState.room}, function(err, data){
                                   var room = data.results[0];
                                   var roomObj = {room: room};
                                    libsb.emit('config-show', roomObj, function(err, tabs) {
                                            delete tabs.room;
                                            
                                            currentConfig = tabs;

                                            $('.meta-conf').empty();

                                            for(i in tabs) {
                                                    sortable.push([tabs[i].prio, i, tabs[i]]);
                                            }
                                            sortable.sort(function(a,b){
                                                    return b[0] - a[0];
                                            });
                                            sortable.forEach(function(tab){
                                                    var className = 'list-item-' + tab[1] + '-settings';
                                                    $('.' + className).remove();
                                                    $('.meta-conf').append('<a class="list-item ' + className + '">' + tab[2].text + '</a>');
                                                    $('.conf-area').append(tab[2].html);
                                            });
                                            // making general settings the default tab
                                            $('.list-item-general-settings').addClass('current');
                                            $('.list-view-general-settings').addClass('current');

                                     });
                                });
			}
		}
		next();
	});
});
