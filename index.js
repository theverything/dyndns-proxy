var url = require('url');
var path = require('path');
var http = require('http');
var httpProxy = require('http-proxy');
var fs = require('fs');

var proxy = httpProxy.createProxyServer({});

var IP_FILE = path.join(__dirname, 'ip.txt');
var AUTH_TOKEN = process.env.AUTH_TOKEN;
var PROXY_PORT = process.env.PROXY_PORT;

var server = http.createServer(function(req, res) {
  var uri = url.parse(req.url, true);
  var pathname = uri.pathname;
  var query = uri.query;

  if (pathname === '/update-ip' && query.auth === AUTH_TOKEN && query.ip) {
    fs.writeFile(IP_FILE, query.ip, function (err) {
      if (err) {
        console.error('ERROR: ' + err);
        res.writeHead(500, { 'Content-Type': 'text/plain'});
        res.write(err);
      } else {
        console.log('UPDATE: ' + query.ip);
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.write('success');
      }
      res.end();
    });
  } else {
    fs.readFile(IP_FILE, function (err, ip) {
      var target;

      if (ip) {
        target = 'http://' + ip + ':' + PROXY_PORT;

        console.log('PROXY: ' + target + uri.path);
        proxy.web(req, res, { target: target }, function (err) {
          console.log('PROXY_ERROR: ' + err);
          res.writeHead(500, { 'Content-Type': 'text/plain'});
          res.write(err);
          res.end();
        });
      } else {
        console.log('ERROR: missing ip');
        res.writeHead(424, { 'Content-Type': 'text/plain'});
        res.write('missing ip');
        res.end();
      }
    });
  }
});

server.listen(8080);