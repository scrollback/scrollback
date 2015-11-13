CREATE FUNCTION json_cat (a jsonb, b jsonb) RETURNS jsonb AS $$
	a = JSON.parse(a); b = JSON.parse(b);
    
	var i, j, el = { _: a }, stacka = [el], stackb = [{ _: b }];
	// Wrapping inputs because ONLY objects may be pushed into the stacks
	
	do {
		a = stacka.pop(); b = stackb.pop();
		
		for (i in b) {
			if (b[i] === null) { //             null in object: deletion marker
				delete a[i];
			} else if (b[i] instanceof Array) { //              array operation
				if (a[i] instanceof Array) { //               on existing array
					if (b[i][0] === null && b[i][b[i].length-1] === null) {
						//                             merge without duplicates
						for (j = 1; j < b[i].length - 1; j++) {
							if (a[i].indexOf(b[i][j]) < 0) a[i].push(b[i][j]);
						}
					} else if (b[i][b[i].length-1] === null) { //       prepend
						a[i] = b[i].slice(0, -1).concat(a[i]);
					} else if (b[i][0] === null) { //                    append
						a[i] = a[i].concat(b[i].slice(1));
					} else { //                                         replace
						a[i] = b[i];
					}
				} else { //                         operation creates new array
					if (b[i][0] === null) b[i].shift();
					if (b[i][b[i].length-1] === null) b[i].pop();
					a[i] = b[i];
				}
			} else if (typeof b[i] === "object" && typeof a[i] === "object") {
				if (b._ === null || a[i] instanceof Array) { //  replace object
					delete b._;
					a[i] = b[i];
				} else { //                                       merge objects
					stacka.push(a[i]);
					stackb.push(b[i]);
				}
			} else { //                                     primitives: replace
				a[i] = b[i];
			}
		}
	} while (stacka.length);
	
    return JSON.stringify(el._);
$$ LANGUAGE plv8 IMMUTABLE;

CREATE OPERATOR || ( PROCEDURE = json_cat, leftarg = jsonb, rightarg = jsonb );
