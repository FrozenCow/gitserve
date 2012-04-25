var gitteh = require('gitteh');
var mime = require('mime');

exports.serveRepository = serveRepository;

function serveRepository(repo,req,res,next) {
	if (typeof repo === 'string') {
		repo = gitteh.openRepository(repo);
	}
	function serve(req,res,next) {
		var path = req.url||req;
		var m = /^\/?([ctb]):([A-z0-9\._\-]+)(\/.*)$/.exec(path);
		if (m) {
			var type = m[1];
			var version = m[2];
			path = m[3];
			({
				c: function(n,cb) { cb(null,n); },
				t: function(n,cb) { resolveReference(repo,'refs/tags/'+n,cb); },
				b: function(n,cb) { resolveReference(repo,'refs/heads/'+n,cb); }
			}[type])(version, resolvedReference);
		} else {
			resolveReference(repo,'refs/heads/master',resolvedReference);
		}

		function resolvedReference(err,ref) {
			if (err) { return next(); }
			if (!ref) { return next(); }
			serveCommit(repo,ref,normalizePath(path),res,next);
		}
	}
	if (typeof req === 'undefined') {
		return serve;
	} else {
		serve(req,res,next);
	}
}

function normalizePath(path) {
	if (path.length === 0 || path.substr(-1) === '/') {
		path += 'index.html';
	}
	if (path[0] === '/') {
		path = path.substr(1);
	}
	return path;
}

function serveReferencedCommit(repo,ref,path,res,next) {
	resolveReference(repo,ref,function(err, commitRef){
		if (err) { return next(); }
		serveCommit(repo,commitRef,path,res,next);
	});
}

function resolveReference(repo, reference, callback) {
	repo.getReference(reference, onRef);
	function onRef(err, ref) {
		if (err) { return callback(err); }
		if (ref.type === gitteh.GIT_REF_OID) {
			callback(null, ref.target);
		} else if (ref.type === gitteh.GIT_REF_SYMBOLIC) {
			ref.resolve(onRef);
		} else {
			callback(new Error('Got unknown reference type: ' + ref.type));
		}
	}
}

function serveCommit(repo,commitRef,path,res,next) {
	repo.getCommit(commitRef, function(err, commit) {
		if (err) return next(err);
		repo.getTree(commit.tree, function(err, tree) {
			if (err) return next(err);
			var entry = getEntry(tree,path);
			if (!entry) return next();
			serveEntry(repo,entry,res,next);
		});
	});
}

function getEntry(tree,path) {
	for (var i=0; i < tree.entries.length; i++) {
		if (tree.entries[i].name === path) {
			return tree.entries[i];
		}
	}
}

function serveEntry(repo,entry,res,next) {
	repo.getBlob(entry.id, function(err, buf) {
		if (err) return next(err);
		if (!buf.data) return next();
		serveBuffer(entry.name,buf.data,res);
	});
}

function serveBuffer(filename,buffer,res) {
	var contentType = mime.lookup(filename);
	res.setHeader('Content-Length', buffer.length);
	res.setHeader('Content-Type', contentType);
	res.end(buffer);
}
