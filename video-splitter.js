var url = 'http://127.0.0.1:1337';
var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
require('child_process').exec(start + ' ' + url);


var http = require('http');
var path = require("path"); 
var fs = require("fs"); 
var exec = require('child_process').exec;

http.createServer(function (req, res) {
  if (req.method === 'OPTIONS') {
      console.log('!OPTIONS');
      var headers = {};
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400';
      headers["Access-Control-Allow-Headers"] = "X-reqed-With, X-HTTP-Method-Override, Content-Type, Accept";
      res.writeHead(200, headers);
      res.end();
  } 
  else if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var data = JSON.parse(body);
        var localPath = __dirname;
        var inputFilePath = localPath+"/videos/"+data.inputFilePath;
        var outputFilePath = localPath+"/videos/output-"+data.inputFilePath
        var start = data.begin;
        var end = data.end;
        
        var command = "ffmpeg -y -ss "+start+" -t "+(end-start)+" -i \""+inputFilePath+"\" -vcodec copy -acodec copy \""+outputFilePath+"\"";
        exec(command, function(error, stdout, stderr) {
          var msg = ""
          if(error) {
            console.log(error);
            msg = error.toString();
            res.writeHead(500, {'Content-Type': 'text/plain'});
          }
          else {
            console.log(stdout);
            res.writeHead(200, {'Content-Type': 'text/plain'});
          }
          res.end(msg);
        });
    });
  }
  else if (req.method == 'GET') {
    var filename = "index.html";
    if(req.url != "/") {
      filename = req.url
    }
    
    var ext = path.extname(filename);
    var localPath = __dirname;
    var validExtensions = {
      ".html" : "text/html",      
      ".js": "application/javascript", 
      ".css": "text/css",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".png": "image/png",
      ".ico": "image/x-icon"
    };
    var mimeType = validExtensions[ext];
   
    if (mimeType) {
      localPath += "/interface/"+filename;
      fs.exists(localPath, function(exists) {
        if(exists) {
          console.log("Serving file: " + localPath);
          getFile(localPath, res, mimeType);
        } else {
          console.log("File not found: " + localPath);
          res.writeHead(404);
          res.end();
        }
      });
   
    } else {
      console.log("Invalid file extension detected: " + ext)
    }
  }
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

function getFile(localPath, res, mimeType) {
  fs.readFile(localPath, function(err, contents) {
    if(!err) {
      res.setHeader("Content-Length", contents.length);
      res.setHeader("Content-Type", mimeType);
      res.statusCode = 200;
      res.end(contents);
    } else {
      res.writeHead(500);
      res.end();
    }
  });
}