/* global Bus */

var core = new Bus();

core.on('test', function first (d, n) { console.log('first callback', d, n); n(); });
core.on('test', function second (d, n) { console.log('second callback', d, n); n(); });
core.on('test', function third (d, n) { console.log('third callback', d, n); n(); }, 300);

core.emit('test', 'hello!');
