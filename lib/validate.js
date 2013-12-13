module.exports = function(room){
    return (room.match(/^[a-z][a-z0-9\_\-\(\)]{2,32}$/i)?
        room!='img'&&room!='css'&&room!='sdk':false);
};