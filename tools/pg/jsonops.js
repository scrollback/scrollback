// CREATE FUNCTION jsonUnion (a jsonb, b jsonb) RETURNS jsonb AS $$

function jsonCat (a, b) {
//	a = JSON.parse(a);
//	b = JSON.parse(b);
    
	var i, j, el = { _: a }, stacka = [el], stackb = [{ _: b }];
	
	do {
		a = stacka.pop();
		b = stackb.pop();

		for (i in b) {
			console.log(i);

			if (b[i] === null) {
				delete a[i];
			} else if (b[i] instanceof Array) {
				if (a[i] instanceof Array) {
					if (b[i][0] === null && b[i][b[i].length-1] === null) {
						for (j = 1; j < b[i].length - 1; j++) {
							if (a[i].indexOf(b[i][j]) < 0) a[i].push(b[i][j]);
						}
					} else if (b[i][b[i].length-1] === null) {
						a[i] = b[i].slice(0, -1).concat(a[i]);
					} else if (b[i][0] === null) {
						a[i] = a[i].concat(b[i].slice(1));
					} else {
						a[i] = b[i];
					}
				} else {
					if (b[i][0] === null) b[i].shift();
					if (b[i][b[i].length-1] === null) b[i].pop();
					a[i] = b[i];
				}
			} else if (typeof b[i] === "object" && typeof a[i] === "object") {
				if (b._ === null || a[i] instanceof Array) {
					delete b._;
					a[i] = b[i];
				} else {
					stacka.push(a[i]);
					stackb.push(b[i]);
				}
			} else {
				a[i] = b[i];
			}
		}
	} while (stacka.length);
	
	return el._;
	
//    return JSON.stringify(a);
	
}
// $$ LANGUAGE plv8 IMMUTABLE;

it("should merge objects recursively", () => {
	console.log(jsonCat({
		a: 1,
		b: { d: 4, c: false },
		c: [1, 2, 3]
	}, {
		b: { c: null },
		c: [null, 3, 5, null]
	}));
});



/*
	Limitations:
	- null is used to signal operations, and cannot be stored.
	- objects may not have a key which is a single underscore.

	Array operations:
	- Replace whole array		[ item, item, item ]
	- Append items				[ null, item, item ]
	- Prepend items				[ item, item, null ]
	- Add items if unique		[ null, item, null ]
	
	- Insert items at index		{ 7: [ item ] }
	- Remove item at index		{ 7: null }
	- Replace item at index		{ 7: item }
	- Remove items by value		{ _: [ item ] }
	
	Replacing the whole array and appending with or without duplicates
	will work correctly even if no array exists.
	
	Object operations:
	- Replace whole object		{ _: null, key: value }
	- Add items					{ key: value }
	- Replace items				{ key: value }
	- Remove items				{ key: null  }
	
	Replace object with array	[ item, item ]
*/

