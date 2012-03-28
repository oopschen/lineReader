var FileByteReader = require('./fileByteReader.js').FileByteReader;
var iconv = require('iconv-lite');

var NL = '\n';

var lr = function(file,encoding){
	this.path = file;
	var sel = this;
	this.encoding = !encoding ? 'utf-8' : encoding;
	new FileByteReader(this.path,function(err){
		if(err) {
			sel._init_err = err;
			this.close();
			return;
		}
		sel._fbr = this;
	});
};

var concatBuf = function() {
	if(0 >= arguments.length) {
		return;
	}
	var tol = 0;
	for(var i=0;i<arguments.length;i++) {
		if(!arguments[i]) {
			continue;
		}
		tol += arguments[i].length;
	}

	var buf = new Buffer(tol);
	var start = 0;
	for(var i=0;i<arguments.length;i++) {
		if(!arguments[i]) {
			continue;
		}
		arguments[i].copy(buf,start,0,arguments[i].length);
		start += arguments[i].length;
	}
	return buf;
};

lr.prototype.readline = function(cb) {
	var lrSelf = this;
	var callback = !cb?function(){}:cb;
	if(this._init_err) {
		callback(this._init_err);
		return;
	}
	if(!this._fbr) {
		setTimeout(function(lr,cb) {
			lr.readline(cb);
		},5,lrSelf,callback);
		return;
	}
	this._fbr.read(function(err,buf){
		lrSelf._parseBytes.call(lrSelf,err,buf,this,callback);
	});
};

lr.prototype._parseBytes = function(err,buffer,fbr,cb) {
	if(err) {
		fbr.close();
		cb(err);
		return;
	}
	//end of file
	if(!buffer) {
		cb(undefined,undefined);
		fbr.close();
		return;
	}
	var buf = concatBuf(this._buf,buffer);
	var left = this._parseLine(buf,cb);
	if(true === left) { //exact a line
	} else if (false === left) { // one line not full
		this._buf = buffer;
		this.readline(cb);
	} else { // not a mod of line
		this._buf = left;
	}
};

lr.prototype._parseLine = function(buffer,cb) {
	if(!buffer) {
		return false;
	}


	var str = iconv.decode(buffer,this.encoding);
	var NLPos = str.indexOf(NL);
	if(-1 != NLPos) {
		if(NL == str.charAt(str.length-1)) {
			var ret = str.replace(/\r/g,'').split(NL);
			cb(undefined,ret.slice(0,ret.length-1));
			return true;
		} else {
			var lines = str.split(NL);
			var ret = [];
			for(var i=0;i<lines.length-1;i++) {
				ret.push(lines[i].replace(/\r/g,''));
			}
			cb(undefined,ret);
			// return undeal bytes
			return new Buffer(lines[lines.length-1]);
		}
	 } else {
		 return false;
	 }
};

exports.LineReader = lr;
