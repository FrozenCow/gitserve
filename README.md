gitserve
========

A Node HTTP server that serves static files directly from a bare Git repositories.
This project allows you to easily push your Git changes to a remote git repository and instantly have your files published online. It also allows you to visit all the different versions that your Git repository has, by branch, by tag and by specific commits.

## Installation ##

	$ git clone git://github.com/FrozenCow/gitserve.git
	$ cd gitserve
	$ npm install

## Example ##

Presume you have a working copy in Git with some HTML, Javascript and CSS files. Like this:

	+ yourproject
		+ css
		+ scripts
		index.html
		otherpage.html

These files are all on the master branch in your Git repository and we want to publish these files on a server.

Presume you have gitserve installed in `/opt/gitserve/` on your server.

Go to `/opt/gitserve/` and make a directory called `repositories`:

	$ mkdir repositories

Next make a bare repository, which will be served by gitserve:

	$ git init --bare repositories/myproject

Now start gitserve in `/opt/gitserve/`:

	$ node server.js

Now go to your working copy of 'yourproject' and push to `/opt/gitserve/repositories/yourproject` on your server:

	$ git push --tags yourserver.com:/opt/gitserve/repositories/yourproject master

Now you can view the latest version of the master-branch at http://yourserver:8080/yourproject/, which will show `index.html`.

You also can access the different versions of your repository. For example:
* unstable-branch: http://yourserver:8080/yourproject/b:unstable/
* v1.0-tag: http://yourserver:8080/yourproject/t:v1.0/
* Specific commit: http://yourserver:8080/yourproject/c:d761435c3c8d5388b2e6f86c09b59a0cfc94beba/
