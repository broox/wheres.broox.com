/*
//check for value in array
Array.prototype.exists = function(search) {
	if (this.length == 0)
		return false;

	for (var i = 0; i < this.length; i++) {
		if (this[i] == search) return true;
	}
	
	return false;
}
*/

//trim whitespace from beginning/end of string
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,'');
}

var broox = {};
broox.log = function(msg) { if (window.console) { console.log(msg); } }

broox.dateFromMysql = function(datetime) {
	//input has to be in this format: 2007-06-05 15:26:02
	var regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
	var parts = datetime.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
	return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

broox.inArray = function(needle, haystack, argStrict) {
  var key = '', 
      strict = !!argStrict;
 
  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true;
      }
    }
  }
  return false;
}