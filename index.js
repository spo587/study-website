
var express = require('express');

var app = express();

var server = require('http');
var serve = server.createServer(app);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser);

var br = require('./backReload');



app.post('/data', function(req, res){
    //console.log(JSON.stringify(req.body));
    //req.pipe(process.stdout);
    //console.log(req);
    
    console.log(req.body);
    var obj = req.body;
    // var excerpt = findExcerpt(obj);
    // var condition = findCondition(obj);
    // var winner = findWinner(obj);
    // var rankings = findRankings(obj);
    db.data.insert({data: obj})
});


var Datastore = require('nedb'), db = {}; //new Datastore({filename: 'test2', autoload: true});

//db.users = new Datastore({filename: 'data/users.db'});
db.data = new Datastore({filename: 'data.db', autoload: true});
//db.users.loadDatabase();

db.data.loadDatabase();

//db.data.insert({excerpt: 'beethoven', condition: 4, winner: 2, rankings: [3,5,8]});

var io = require('socket.io')(serve);
// var ejs = require('ejs');

var excerpts = require('./excerpts')

var nedb = require('nedb');

var excerptNames = ['beethoven', 'bach'];

var sockets = [];

excerptNames.forEach(function(excerptName){
    sockets.push(io.of('/a/' + excerptName));
    sockets.push(io.of('/p/' + excerptName));
    sockets.push(io.of('/m/' + excerptName));
    appGet('/p/' + excerptName, '/launchpage.html');
    appGet('/m/' + excerptName, '/launchpage.html');
    appGet('/a/' + excerptName, '/launchpage.html');
});

var conditions = [
                    {type: 'video', length: 'long'}, 
                    {type: 'video', length: 'short'},
                    {type: 'audio', length: 'long'},
                    {type: 'audio', length: 'short'}
                ];


function setUpSocket(socket){
    var conditions = range(24);
    shuffleArray(conditions);
    conditions.pointer = 0;
    socket.on('connection', function(sock){
        console.log('connection to ' + socket.name);
        var condition = nextInArray(conditions);
        console.log(condition);
        sock.emit('change-link', condition);
    });
}

sockets.forEach(function(socket){
    setUpSocket(socket);
});


function appGet(urlPath, fileExtension){
    app.get(urlPath, function(req, res){
        res.sendFile(__dirname + fileExtension);
    });
}

function appRender(urlPath, ejsFile, data){
    app.get(urlPath, function(req, res){
        res.render(ejsFile, data);
    });
}


var pages = range(24);

var longVideo = pages.slice(0,6);
var shortVideo = pages.slice(6,12);
var longAudio = pages.slice(12, 18);
var shortAudio = pages.slice(18, 24);



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


function getExcerptPages(pagePaths, excerpt, length, audioOrVideo){
    pagePaths.forEach(function(page, index){
        var orders = [[0,1,2], [1,2,0], [2,1,0], [2,0,1], [0,2,1], [1,0,2]];
        var links = getLinks(excerpts.beethovenLinks[audioOrVideo][length].links, index, orders);
        //console.log(links);
        var paths = ['/m/' + excerpt + '/' + String(page), 
                    '/p/' + excerpt + '/' + String(page),
                    '/a/' + excerpt + '/' + String(page)];
        paths.forEach(function(path){
            appRender(path, audioOrVideo + '.ejs', {links: links, path: path, noBack: noBack});
        });
        
    });
    
}

function getAllPages(excerpt){
    getExcerptPages(longVideo, excerpt, 'long', 'video');
    getExcerptPages(shortVideo, excerpt, 'short', 'video');
    getExcerptPages(longAudio, excerpt, 'long', 'audio');
    getExcerptPages(shortAudio, excerpt, 'short', 'audio');

}

getAllPages('beethoven');

// getExcerptPages(longVideo, 'beethoven', 'long', 'video');
// getExcerptPages(longAudio, 'beethoven', 'long', 'audio');

function getLinks(arrayOfLinks, index, orders){
    return orders[index].map(function(ind){
        return arrayOfLinks[ind];
    });
}

function generateOrder(arrayOfLinks){
    var order = randomFromArrayAndDelete(orders);
    return {links: 
            [arrayOfLinks[order[0]], arrayOfLinks[order[1]], arrayOfLinks[order[2]]]
            }
}

appGet('/test.html', '/test.html')
appGet('/', '/home.html');
appGet('/home.js', '/home.js');
appGet("/node_modules/socket.io/node_modules/socket.io-client/socket.io.js", "/node_modules/socket.io/node_modules/socket.io-client/socket.io.js")
appGet('/p', '/excerpts.html');
appGet('/a', '/excerpts.html');
appGet('/m', '/excerpts.html');
appGet('/data.db', '/data.db');

function nextInArray(arr){
    arr.pointer += 1;
    var index = arr.pointer % arr.length;
    return arr[index];
}

function range(end) {
    var arr = []
    for (var i=0; i<end; i++)
        arr.push(i)
    return arr
}


function randomFromArrayAndDelete(a){
    var choice = a[Math.floor(Math.random()*a.length)];
    a.splice(a.indexOf(choice), 1);
    return choice;
}

function randomFromArray(a){
    var choice = a[Math.floor(Math.random()*a.length)];
    return choice;
}


function setLink(links){
    return randomFromArrayAndDelete(links);
}

var port = process.env.PORT || 8080;

serve.listen(port, function() {
    //console.log('Our app is running on http://localhost:' + port);
});


function noBack(){
    if (typeof history.pushState === "function") {
        history.pushState("jibberish", null, null);
        window.onpopstate = function () {
            history.pushState('newjibberish', null, null);
            // Handle the back (or forward) buttons here
            // Will NOT handle refresh, use onbeforeunload for this.
        };
    }
    else {
        var ignoreHashChange = true;
        window.onhashchange = function () {
            if (!ignoreHashChange) {
                ignoreHashChange = true;
                window.location.hash = Math.random();
                // Detect and redirect change here
                // Works in older FF and IE9
                // * it does mess with your hash symbol (anchor?) pound sign
                // delimiter on the end of the URL
            }
            else {
                ignoreHashChange = false;   
            }
        };
    }
}