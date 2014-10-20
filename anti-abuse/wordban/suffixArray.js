/**
copied from: https://github.com/tixxit/suffixarray
 * An implementation of the linear time suffix array construction of 
 * Karkkainen & Sanders:
 *
 * "Simple Linear Work Suffix Array Construction", Karkainen and Sanders.
 *
 * Creating a suffix array is very simple; just call suffixArray(...) with
 * either a string or a function that returns integers and its length. For
 * example,
 *
 * var s = "Sort this!";
 * suffixArray(s);                  // Returns [4, 9, 0, 6, 7, 1, 2, 8, 3, 5].
 *
 * function reverse(i) { return s.charCodeAt(s.length - 1 - i) }
 * suffixArray(reverse, s.length);  // Returns [5, 0, 9, 3, 2, 8, 7, 1, 4, 6].
 *
 * @author Thomas Switzer
 */
(function() {

var global = this,
    floor = Math.floor,
    identity = function(x) { return x },
    undefined;

/**
 * Sorts an array of (unsigned) integers in linear time. The values of the
 * array (a) act as keys, which are passed to the key function which returns an
 * integer value.
 *
 * @param a An array of keys to sort.
 * @param key A function that maps keys to integer values.
 * @return The array a.
 */
function bsort(a, key) {
    var len = a.length,
        buckets = [],
        i = len, j = -1, b, d = 0,
        keys = 0,
        bits;
    key = key || identity;
    while (i--)
        j = Math.max(key(a[i]), j);
    bits = j >> 24 && 32 || j >> 16 && 24 || j >> 8 && 16 || 8;
    for (; d < bits; d += 4) {
        for (i = 16; i--;)
            buckets[i] = [];
        for (i = len; i--;)
            buckets[(key(a[i]) >> d) & 15].push(a[i]);
        for (b = 0; b < 16; b++)
            for (j = buckets[b].length; j--;)
                a[++i] = buckets[b][j];
    }
    return a;
}


function isInt(n) {
    return typeof n == "number" || n instanceof Number;
}

function isStr(s) {
    return Object.prototype.toString.call(s) == "[object String]";
}


function wrap(s) {
    return typeof s == "function" ? s : (isStr(s)
            ? function(i) { return s.charCodeAt(i) }
            : function(i) { return s[i] });
}


/**
 * Returns the suffix array of the string s. The suffix array is constructed
 * in linear time.
 *
 * The string s can either be an Unicode string (ie. JavaScript String object)
 * or a function that takes an index (integer >= 0) and returns another
 * integer (a "symbol"). If a function is provided, then another argument
 * specifying its length (integer >= 0) must be provided.
 *
 * This also takes a 3rd optional parameter that dictates how to treat the end
 * of the string. This can be either "min" or "wrap". If it is "min", then 
 * characters after the end of the string are treated as 0's (the minimum).
 * If "wrap" is given, then the end of the string wraps back around to the
 * beginning. If this parameter is omitted, then "wrap" is assumed.
 *
 * In the case of strings, you can omit the 2nd paramter (length) and still
 * provide the 3rd paramter. For instance, suffixArray(str, "min").
 *
 * The returned array contains the indexes of the string in the lexicographical
 * order of the suffixes that start at those indexes.
 *
 * @param s A string or function that maps ints between [0, len) to integers.
 * @param len The length of s (optional if s is a string, required otherwise).
 * @param end Either "min", "wrap" or leave out (defaults to "wrap").
 * @return An array of indexes into s.
 */
global.suffixArray = function(s, len, end) {
    end = end || len;
    len = isInt(len) ? len : s.length;

    if (end == "wrap")
        return wrappedSuffixArray(s, len);
    else
        return _suffixArray(wrap(s), len);
}


// Export the Bucket Sort.
global.suffixArray.bsort = bsort;


/**
 * Constructs the suffix array of s. It takes either a string, an array, or a
 * function that takes an integer and returns a unsigned integer. It also takes
 * an optional 2nd paramter, the length. This is required if the first
 * parameter is a function.
 *
 * This uses the nice idea from Karkkainen & Sander's paper of replacing each
 * letter with the equivalent k-letter version (3 in their paper, 2 in this
 * algorithm). This is repeated recursively until all the letters are
 * different. This doesn't have the nice 1/3 pruning / merge step of their
 * algorithm, but still performs relatively fast, running in O(n log n).
 *
 * @param s A string, array, or function.
 * @param len The length of s.
 * @return The order of the suffixes.
 */
function wrappedSuffixArray(s, len) {
    len = isInt(len) ? len : s.length;
    s = wrap(s);

    var array = [],
        swap = [],
        order = [],
        span,
        sym,
        i = len;

    while (i--)
        array[i] = s(order[i] = i);

    for (span = 1; sym != len && span < len; span *= 2) {
        bsort(order, function(i) { return array[(i + span) % len] });
        bsort(order, function(i) { return array[i] });

        sym = swap[order[0]] = 1;
        for (i = 1; i < len; i++) {
            if (array[order[i]] != array[order[i - 1]] || array[(order[i] + span) % len] != array[(order[i - 1] + span) % len])
                sym++;
            swap[order[i]] = sym;
        }

        tmp = array;
        array = swap;
        swap = tmp;
    }

    return order;
}


/* Constructs the suffix array of s. In this case, s must be a function that
 * maps integers between 0 and len - 1 to "symbols" (unsigned integers). It
 * returns the suffixes in lexicographical order as an array of indexes where
 * those suffixes start.
 *
 * I have tried to keep the code reasonably well commented. Both for my sake,
 * and yours. That said, my code was not written with pedagogy in mind, but
 * to be relatively fast and have a small minified size.
 *
 * The description of the algorithm in the paper is very concise and is well
 * worth a read.
 *
 * The C code accompanying the paper is very terse and, IMHO, creates more
 * confusion than clarity. While the algorithm itself is fairly simple (simple
 * and fast, who wants more?), it does deal with quite a bit of abstraction.
 * That is, you are dealing with a lot of placeholders, rather than concrete
 * objects; indexes into the string to represent suffixes, lexical names
 * representing triplets of symbols, indexes of these lexical names, etc.
 */
function _suffixArray(_s, len) {
    var a = [],
        b = [],
        alen = floor(2 * len / 3),  // Number of indexes s.t. i % 3 != 0.
        blen = len - alen,          // Number of indexes s.t. i % 3 = 0.
        r = (alen + 1) >> 1,        // Number of indexes s.t. i % 3 = 1.
        i = alen,
        j = 0,
        k,
        lookup = [],
        result = [],
        tmp, cmp,
        s;

    if (len == 1)
        return [ 0 ];

    s = function(i) { return i >= len ? 0 : _s(i) };

    // Sort suffixes w/ indices % 3 != 0 by their first 3 symbols (triplets).

    while (i--)
        a[i] = ((i * 3) >> 1) + 1;  // a = [1, 2, 4, 5, 7, 8, 10, 11, 13, ...]

    for (i = 3; i--;)
        bsort(a, function(j) { return s(i + j) });

    // Assign lexicographical names (j) to the triplets of consecutive symbols,
    // s.t. the order of the lex. names match the lex. order of the triplets.

    // Array b contains lex. names in the order they appear in s for i % 3 != 0

    j = b[floor(a[0] / 3) + (a[0] % 3 == 1 ? 0 : r)] = 1;
    for (i = 1; i < alen; i++) {
        if (s(a[i]) != s(a[i-1]) || s(a[i] + 1) != s(a[i-1] + 1) || s(a[i] + 2) != s(a[i-1] + 2))
            j++;
        b[floor(a[i] / 3) + (a[i] % 3 == 1 ? 0 : r)] = j;
    }

    // If all lex. names are unique, then a is already completely sorted.

    if (j < alen) {

        // Otherwise, recursively sort lex. names in b, then reconstruct the
        // indexes of the sorted array b so they are relative to a.
        
        b = _suffixArray(function(i) { return b[i] }, alen);

        for (i = alen; i--;)
            a[i] = b[i] < r ? b[i] * 3 + 1 : ((b[i] - r) * 3 + 2);

    }

    // Create a reverse lookup table for the indexes i, s.t. i % 3 != 0.
    // This table can be used to simply determine the sorted order of 2
    // suffixes whose indexes are both not divisible by 3.

    for (i = alen; i--;)
        lookup[a[i]] = i;
    lookup[len] = -1;
    lookup[len + 1] = -2;

    /**
     * This is a comparison function for the suffixes at indices m & n that
     * uses the lookup table to shorten the searches. It assumes that
     * n % 3 == 0 and m % 3 != 0.
     */
    cmp = function(m, n) {
        return (s(m) - s(n)) || (m % 3 == 2
            ? (s(m + 1) - s(n + 1)) || (lookup[m + 2] - lookup[n + 2])
            : (lookup[m + 1] - lookup[n + 1]))
    };
    
    // Sort remaining suffixes (i % 3 == 0) using prev result (i % 3 != 0).

    b = len % 3 == 1 ? [ len - 1 ] : [];
    for (i = 0; i < alen; i++)
        if (a[i] % 3 == 1)
            b.push(a[i] - 1);
    bsort(b, function(j) { return s(j) });

    // Merge a (i % 3 != 0) and b (i % 3 == 0) together. We only need to
    // compare, at most, 2 symbols before we end up comparing 2 suffixes whose
    // indices are both not divisible by 3. At this point, we can use the
    // reverse lookup array to order them.
    
    for (i = 0, j = 0, k = 0; i < alen && j < blen;)
        result[k++] = cmp(a[i], b[j]) < 0 ? a[i++] : b[j++];
    while (i < alen)
        result[k++] = a[i++];
    while (j < blen)
        result[k++] = b[j++];

    return result;
}

}).call();
module.exports = suffixArray;
