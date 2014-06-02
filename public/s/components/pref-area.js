/* jshint browser: true */
/* global $, libsb */

var currentConfig;

$(".conf-save").on("click", function(){
    if(currentState.mode == 'pref'){
        var userObj = {
            id: libsb.user.id,
            description: '',
            identities: [],
            params: {}
        };
        libsb.emit('pref-save', userObj, function(err, user){
            libsb.emit('user-up', user, function(err, data){
                    currentConfig = null;
                    libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
            });
        });
    }
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
               if(libsb.user.id.indexOf('guest-') == 0){
                    libsb.emit('navigate', {
                        mode: 'normal'
                    });
                }
 
                // if currentConfig is blank, then
                if(!currentConfig){
                    libsb.emit('getUsers', {ref: libsb.user.id}, function(err,data){
                         var user = data.results[0];
                         console.log("Get users query executed :", libsb.user.id, data);
                         if(!user.params) user.params = {};
                         var userObj = {user: user}
                         libsb.emit('pref-show', userObj,function(err, tabs) {
                            delete tabs.user;
                            currentConfig = tabs;

                            $('.meta-pref').empty();
                            $('.pref-area').empty();
                            
                            for(i in tabs) {
                                    sortable.push([tabs[i].prio, i, tabs[i]]);
                            }

                            sortable.sort(function(a,b){
                                    return b[0] - a[0];
                            });

                            sortable.forEach(function(tab){
                                    var className = 'list-item-' + tab[1] + '-settings';
                                    $('.' + className).remove();
                                    $('.meta-pref').append('<a class="list-item ' + className + '">' + tab[2].text + '</a>');
                                    $('.pref-area').append(tab[2].html);
                            });

                            // making profile settings the default list-item
                            $('.list-item-profile-settings').addClass('current');
                            $('.list-view-profile-settings').addClass('current');

                            $('#desktop-notification').change(function(){
                                if($(this).is(':checked')){
                                    lace.notify.request();
                                    var laceObj = lace.notify.support();
                                    if(laceObj.permission === "denied"){
                                            lace.alert.show({type: 'error', body: 'Permission for desktop notifications denied!'});
                                    }
                                }
                            });
                       });

                    });
               }
        }
        next();
});
