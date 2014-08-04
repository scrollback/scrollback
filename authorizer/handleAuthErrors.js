/* jshint multistr: true */
var lace = require('../lib/lace.js');
module.exports = function (error) {
	
	var action = error.action, 
		requiredRole = error.requiredRole,
		currentRole = error.currentRole,
		errorMessage = 'Unknown Authorization Error! You are not allowed to perfom this action :( ';
	
	switch (action) {
		case 'admit':
			errorMessage = 'You are not authorized to admit a user to this room. Your role needs to be: <b>' + requiredRole + '</b> to perform this \
			action. ' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'expel':
			errorMessage = 'You are not authorized to expel a user from this room. Your role needs to be: <b>' + requiredRole + '</b> to \
			perform this action. ' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'back':
			errorMessage = 'You are not authorized to read messages in this room. Your role needs to be: <b>' + requiredRole + '</b> to perform this \
			action.	' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'edit':
			errorMessage = 'You are not authorized to edit messages in this room. Your role needs to be: <b>' + requiredRole + '</b> to perform this \
			action.	' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'join':
			errorMessage = 'Guests cannot follow rooms! Please sign in.';
			break;
			
		case 'getTexts':
			errorMessage = 'You are not authorized to view messages in this room. Your role needs to be: <b>' + requiredRole + '</b> to \
			perform this action. ' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'getThreads':
			errorMessage = 'You are not authorized to view message threads in this room. Your role needs to be: <b>' + requiredRole + '</b> \
			to perform this action. ' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'getRooms':
			errorMessage = 'You are not authorized to view the room(s) info you requested. ' + 'Your role is: <b>' + currentRole + '</b>, You need \
			to be a: <b>' + requiredRole + '</b> to perform this action'; 
			break;
			
		case 'getUsers':
			errorMessage = 'You are not authorized to view the user(s) info you requested. ' + 'Your role is: <b>' + currentRole + '</b>, You need \
			to be a: <b>' + requiredRole + '</b> to perform this action'; 
			break;
			
		case 'room':
			errorMessage = 'You are not authorized to save this room! ' + 'Your role is: <b>' + currentRole + '</b>, You need \
			to be a: <b>' + requiredRole + '</b> to perform this action';
			break;
			
		case 'text':
			errorMessage = 'Message not sent . Your role needs to be: <b>' + requiredRole + '</b> to chat in this room. \
			' + 'Your current role is: <b>' + currentRole + '</b>';
			break;
			
		case 'user':
			errorMessage = 'You are not authorized to save this user account! ' + 'Your role is: <b>' + currentRole + '</b>, Your role needs \
			to be: <p>' + requiredRole + '</b> to perform this action';
			break;
			
		default: 
			errorMessage = 'Unknown Authorization Error! You are not allowed to perfom this action :( ';
	}
	lace.alert.show({type: "error", body: errorMessage});
};