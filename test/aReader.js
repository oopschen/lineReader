var FileByteReader = require('../lib/fileByteReader.js').FileByteReader;
var assert = require('assert');

var path = __dirname + "/a";

var i = 0;
var readCB = function(err,buf,fbr) {
	if(!buf) {
		fbr.close();
		return;
	}
	assert.equal(buf.toString().split('\n')[i],i+1,'fail 1 ea');
	i++;
	fbr.read(readCB);
};
new FileByteReader(path,function(err,fbr){
	if(err) {
		console.error(err);
		return;
	}
	fbr.read(readCB);
});
