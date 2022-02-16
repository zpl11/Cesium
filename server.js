var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
 
function send404(response) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write('Error 404: resource not found.');
    response.end();
}
 
function sendFile(response, filePath, fileContents) {
	//服务端返回静态文件：正确的http头;原来的lookup改为了现在的getType
    response.writeHead(200, { "content-type": mime.getType(path.basename(filePath)) });
    console.log('sendFile content-type:' + mime.getType(path.basename(filePath)));//text/html
    response.end(fileContents);
}
 
function serverStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);//从内存中返回文件给客户端浏览器
    }
    else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                console.log('serverStatic exists absPath:' + absPath);
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;//先缓存文件，为下次直接在内存中使用
                        sendFile(response, absPath, data);//发送文件给客户端浏览器
                    }
                })
            }
            else {
                send404(response);
            }
        })
    }
}
 
var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        console.log('createServer url / return Build/index.html');
        filePath = 'Build/index.html';
    }
    else {
        filePath = 'Build' + request.url;
    }
 
    var absPath = './' + filePath;
    serverStatic(response, cache, absPath);
});
 
server.listen(8080, function () {
    console.log('server listening on port 8080');
});