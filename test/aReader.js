var FileByteReader = require('../lib/fileByteReader.js').FileByteReader;
var assert = require('assert');

var path = __dirname + "/a";

var i = 0;
var readCB = function(err,buf) {
	if(!buf) {
		this.close();
		return;
	}
	assert.equal(buf.toString().split('\n')[i],i+1,'fail 1 ea');
	i++;
	this.read(readCB);
};
new FileByteReader(path,function(err){
	if(err) {
		console.error(err);
		return;
	}
	this.read(readCB);
});
