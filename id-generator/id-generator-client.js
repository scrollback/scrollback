var generate = require('../lib/generate.js');

function generateID(action, next){
    if(!action.id) action.id = generate.uid();
    next();
} 

libsb.on('join-up', generateID, 100);
libsb.on('part-up', generateID, 100);
libsb.on('away-up', generateID, 100);
libsb.on('back-up', generateID, 100);
libsb.on('text-up', generateID, 100);
libsb.on('init-up', generateID, 100);
libsb.on('admit-up', generateID, 100);
libsb.on('expel-up', generateID, 100);
libsb.on('user-up', generateID, 100);
libsb.on('room-up', generateID, 100);


// join part away back text init admit expel user room 
