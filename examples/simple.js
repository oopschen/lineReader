var LineReader = require('lineReader').LineReader;
var assert = require('assert');

var smallLinePath = __dirname + '/smallline'; 

var slr = new  LineReader(smallLinePath);
// call to read lines
slr.readline(function(err,lines){ //error if any fs read error , lines is an array that contains file lines not complete; undefined means the end of file
	assert.equal(lines.length,6,'small line fail');
	assert.equal(lines[5],'','small line fail content');
});
