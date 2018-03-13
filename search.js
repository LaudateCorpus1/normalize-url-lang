'use strict';

function wildcard(w) {
    return function rcompare(s1, s2) {
        var i1 = s1.length;
        var i2 = s2.length;

        while (i1 > 0 && i2 > 0) {
            --i1; --i2;

            if (s1[i1] === w || s2[i2] === w)
                return 0;

            if (s1[i1] > s2[i2])
                return 1;
            if (s1[i1] < s2[i2])
                return -1;
        }

        if ((i1 > 0 && s1[i1 - 1] === w) || (i2 > 0 && s2[i2 - 1] === w))
            return 0;

        if (i1 < i2)
            return -1;
        if (i1 > i2)
            return 1;
        
        return 0;
    };
}

var rcompare = wildcard(null);
rcompare.wildcard = wildcard;

function search(array, element, compare) {
  var mid, cmp;
  var low = 0;
  var high = array.length - 1;
  if (typeof compare === 'undefined') {
      compare = function(a, b) {
          if (a < b)
            return -1;
          if (a > b)
            return 1;
          return 0;
      }
  }

  while(low <= high) {
    mid = low + (high - low >> 1);
    cmp = compare(array[mid], element);

    if(cmp < 0)
      low  = mid + 1;
    else if(cmp > 0)
      high = mid - 1;
    else
      return mid;
  }

  // not found
  return null;
}

module.exports = {
    rcompare: rcompare,
    search: search
};
