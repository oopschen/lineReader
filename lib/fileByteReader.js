var fs = require('fs');

var defaultBufSize = 8192;

var b = function(file,cb){
	this.path = file;
	this.start = 0;
	var bSelf = this;

	var callback = !cb ? function(){}:cb;
	fs.open(file,'r',function(err,fd) {
		if(err) {
			callback.call(bSelf,err);
			return;
		}
		bSelf.fd = fd;
		fs.fstat(fd,function(err,stat) {
			if(err) {
				callback.call(bSelf,err);
				return;
			}
			bSelf.tol = stat.size;
			callback.call(bSelf);
		});
	});
};

b.prototype.read = function(cb) {
	if(this.start >= this.tol ) {
		cb.call(this,undefined,undefined,this);
		return;
	}
	var len = this.tol-this.start;
	len = len > defaultBufSize ? defaultBufSize : len;
	this.start += len;

	var buf = new Buffer(len);
	var bSelf = this;
	fs.read(this.fd,buf,0,buf.length,null,function(err,size,buffer) {
		if(err) {
			cb.call(bSelf,err);
			return;
		}
		cb.call(bSelf,err,buffer);
	});
};

b.prototype.close = function(cb){
	var callback = !cb ? function(){} : cb;
	if(!this.fd) {
		callback();
		return;
	}
	var bSelf = this;
	fs.close(this.fd,function(){
		callback.call(bSelf);
	});
	this.start = 0;
	this.tol = 0;
};

exports.FileByteReader = b;
