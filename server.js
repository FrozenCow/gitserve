var express = require('express');
var path = require('path');
var args = require('commander');
var gitserve = require('./gitserve');

args
	.option('-r, --root <path>', 'Root', 'repositories')
	.option('-p, --port <n>', 'Port', parseInt, 8080)
	.option('-b, --bind <addr>', 'Bind address', null)
	.parse(process.argv);

var app = express.createServer();

app.get('/:repository/*',function(req,res,next) {
	var repo = path.normalize(path.join(args.root,req.params.repository));
	if (repo.slice(0,args.root.length) !== args.root) {
		return next();
	}
	gitserve.serveRepository(repo,req.params[0],res,next);
});

app.listen(args.port, args.bind);