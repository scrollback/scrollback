"use strict";

module.exports = {
	findIndex: findIndex,
	merge: mergeRange,
	getItems: getItems
};


/*
	Finds the insertion point where the value would fit.
*/

function findIndex(items, propName, value, start, end) {
	var pos;
	if (typeof start === 'undefined') {
		return findIndex(items, propName, value, 0, items.length);
	}

	if (value === null) {
		return end;
	}

	if (start >= end) {
		return start;
	}
	pos = ((start + end) / 2) | 0;

	if (items[pos] && items[pos][propName] < value) {
		return findIndex(items, propName, value, pos + 1, end);
	} else if (items[pos - 1] && items[pos - 1][propName] >= value) {
		return findIndex(items, propName, value, start, pos - 1);
	} else {
		return pos;
	}
}




function getItems(ranges, req, propName) {
    var index, startIndex, endIndex, range, missingBefore, missingAfter;
    range = ranges.filter(function (r) {
        return (
            (req[propName] === null && r.end === null) ||
            ((r.start === null || r.start <= req[propName]) &&
            (r.end === null || r.end >= req[propName]))
        );

    })[0];
    if(!range) return ["missing"];

    index = findIndex(range.items, propName, req[propName]);

	if(range.items[index] && range.items[index][propName] === req[propName] && req.before && !req.after) index++;
	/*
		Consider the range [1, 2, 3, 4, 5].
		(index: 3, before: 2) => 2 items [2, 3] so that it is consistent with
		(index: 3, after: 2) =>  2 items [3, 4]. However
		(index: 3, before: 2, after: 2) => 4 items [1, 2, 3, 4].
	*/

    startIndex = index - (req.before || 0);
    endIndex = index + (req.after || 0);

    if(startIndex < 0) {
        if(range.start !== null) missingBefore = true;
        startIndex = 0;
    }

    if(endIndex > range.items.length) {
        if(range.end !== null) missingAfter = true;
        endIndex = range.items.length;
    }

    return Array.prototype.concat(
        (missingBefore? ['missing']: []), // eslint-disable-line no-unexpected-multiline
        range.items.slice(startIndex, endIndex),
        (missingAfter? ['missing']: [])
    );
}

function isInRange(range, value) {
	return (range.start === null || range.start <= value) && (range.end === null || range.end >= value);
}

function mergeRange(ranges, range, propName) {
	var topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex, mergedRange = {};

	if (range.start === null) topRangeIndex = -1;
	else {
		for (
			topRangeIndex = 0;
			topRangeIndex < ranges.length && (
				ranges[topRangeIndex].end !== null &&
				ranges[topRangeIndex].end < range.start);
			topRangeIndex++
		);
	}
	if (range.end === null) bottomRangeIndex = ranges.length;
	else {
		for (
			bottomRangeIndex = ranges.length-1;
			bottomRangeIndex >= 0 && (
				ranges[bottomRangeIndex].start !== null &&
				ranges[bottomRangeIndex].start > range.end);
			bottomRangeIndex--
		);
	}

	if (ranges[topRangeIndex] && isInRange(ranges[topRangeIndex], range.start)) {
		topItemIndex = findIndex(ranges[topRangeIndex].items, propName, range.start);
		while(
			ranges[topRangeIndex].items[topItemIndex-1] &&
			ranges[topRangeIndex].items[topItemIndex-1][propName] === range.start
		) topItemIndex--;
	} else {
		topItemIndex = -1;
	}

	if(ranges[bottomRangeIndex] && isInRange(ranges[bottomRangeIndex], range.end)){
		bottomItemIndex = findIndex(ranges[bottomRangeIndex].items, propName, range.end);
		while(
			ranges[bottomRangeIndex].items[bottomItemIndex] &&
			ranges[bottomRangeIndex].items[bottomItemIndex][propName] === range.end
		) bottomItemIndex++;
	} else {
		bottomItemIndex = -1;
	}

/*	console.log(JSON.stringify(ranges),'\n', JSON.stringify(range),'\n', topRangeIndex, topItemIndex, bottomRangeIndex, bottomItemIndex);*/

	mergedRange = {start: range.start, end: range.end, items: []};

	if(topItemIndex !== -1) {
		mergedRange.start = ranges[topRangeIndex].start;
		mergedRange.items = mergedRange.items.concat(ranges[topRangeIndex].items.slice(0, topItemIndex));
	}

	mergedRange.items = mergedRange.items.concat(range.items);

	if (bottomItemIndex !== -1) {
		mergedRange.items = mergedRange.items.concat(ranges[bottomRangeIndex].items.slice(bottomItemIndex));
		mergedRange.end = ranges[bottomRangeIndex].end;
	}

//	if(topItemIndex === -1) topRangeIndex++;
//	if(bottomItemIndex === -1) bottomRangeIndex--;

	ranges.splice(topRangeIndex, bottomRangeIndex - topRangeIndex + 1, mergedRange);
	return ranges;
}
