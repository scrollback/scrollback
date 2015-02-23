/**
 *It merge c into d
 *@param {object} d default Object
 *@param {object} c this object will be merged into d.
 */
function merge(d, c) {
	for(var i in c) {
		if (typeof d[i] === 'object' && typeof c[i] === 'object' && d[i] !== null && c[i] !== null) {
			if (d[i] instanceof Array && c[i] instanceof Array) {
				// d[i] = d[i].concat(c[i]);
				/*Concatinating the plugins array from the default ones and the ones in
				myConfig is probably not something that we might be interested in.*/
				d[i] = c[i];
			} else {
				merge(d[i], c[i]);
			}
		} else {
			d[i] = c[i];
		}
	}
	return d;
}

module.exports = merge;