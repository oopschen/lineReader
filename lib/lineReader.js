var FileByteReader = require('./fileByteReader.js').FileByteReader;

var NL = '\n';

var lr = function(file,cb){
	this.cb = !cb ? function(){}:cb;
	this.path = file;
	var sel = this;
	new FileByteReader(this.path,function(err,fbr){
		if(err) {
			fbr.close();
			sel.cb(err);
			return;
		}
		sel.readline(fbr);
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

lr.prototype.readline = function(fbr) {
	var lrSelf = this;
	fbr.read(function(){
		lrSelf._parseBytes.apply(lrSelf,arguments);
	});
};

lr.prototype._parseBytes = function(err,buffer,fbr) {
	if(err) {
		fbr.close();
		this.cb(err);
		return;
	}
	if(!buffer) {
		fbr.close();
		return;
	}
	var buf = concatBuf(this._buf,buffer);
	var left = this._parseLine(buf);
	if(true === left) {
	} else if (false === left) {
		this._buf = buffer;
		this.readline(fbr);
	} else {
		this._buf = left;
	}
};

lr.prototype._parseLine = function(buffer) {
	if(!buffer) {
		return ;
	}

	var str = buffer.toString();
	var NLPos = str.indexOf(NL);
	if(-1 != NLPos) {
		if(NL == str.charAt(str.length-1)) {
			var ret = str.replace(/\r/g,'').split(NL);
			this.cb(undefined,ret.slice(0,ret.length-1));
			return true;
		} else {
			var lines = str.split(NL);
			var ret = [];
			for(var i=0;i<lines.length-1;i++) {
				ret.push(lines[i].replce(/\r/g,''));
			}
			this.cb(undefined,ret);
			// return undeal bytes
			return new Buffer(lines[lines.length-1]);
		}
	 } else {
		 return false;
	 }
};

exports.LineReader = lr;
