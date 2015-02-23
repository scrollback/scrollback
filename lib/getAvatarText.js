module.exports = function getAvatarText(username){
			//returns 2 letters which can be overlayed on the user avatar.
			username = username.replace(/[^a-zA-Z]/g, '');
			username = username.toLowerCase();
			if(username.length >= 2) return username.substring(0,2);
			else return "";
}