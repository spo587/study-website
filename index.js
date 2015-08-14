
var express = require('express');

var app = express();

var server = require('http');
var serve = server.createServer(app);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var mysql = require('mysql');



//var example = {data1: 'test', data2: 'test2'}


// connection.query('USE sql586865', function(err, rows, fields) {
//   if (err) throw err;
//   console.log('working');
// });
  //console.log(rows);
  //useOK(connection);
// connection.query(
//   'CREATE TABLE table1'+
//         '(id INT(11) AUTO_INCREMENT, '+
//         'title VARCHAR(255), '+
//         'text TEXT, '+
//         'created DATETIME, '+
//         'PRIMARY KEY (id));', function(err, results){
//     if (err) {
//         console.log('error: ' + err.message);
//         throw err;
//     }
//     console.log('table ready');
// });


var makeTable = function(connection, tablename){
    connection.query(
        'CREATE TABLE ' + tablename +
        '(id INT(11) AUTO_INCREMENT, '+
        'excrpt TEXT, '+
        'cond TEXT, '+
        'part TEXT, '+
        'winner TEXT, '+
        'diff TEXT, '+
        'second TEXT, '+
        'diff2 TEXT, '+
        'PRIMARY KEY (id));', function(err, results) {
            if (err) {
                console.log("ERROR: " + err.message);
                throw err;
            }
            console.log("table ready");
            //tableReady(connection);
        }
    );
}

// var tableReady = function(connection){

// }

// var makeColumn = function(connection, tablename, columnNamesArray){
//     connection.query(
//         columnNamesArray.forEach(function(columnName){
//             'ALTER TABLE ' + tablename + ' ADD ' + columnName + ' VARCHAR(255)'
//         })
//     );
// }

var insertData = function(connection, tablename, obj){
    connection.query(
        'INSERT INTO ' + tablename +
        ' SET excrpt = ?'+
        ', cond = ?' +
        ', part = ?' +
        ', winner = ?' +
        ', diff = ?' +
        ', second = ?' +
        ', diff2 = ?',
        [obj.excerpt,
         obj.condition,
         obj.part,
         obj.winner,
         obj.difficulty,
         obj.second,
         obj.difficulty2],
        function(err, results) {
            if (err) {
                console.log("ERROR: " + err.message);
                throw err;
            }
            console.dir(results);
            console.log("Inserted "+results.affectedRows+" row.");
            console.log("The unique id was " + results.insertId);
            //tableHasData(client);
        }
    );
}

var getData = function(connection, tablename){
    connection.query(
        'SELECT * FROM ' + tablename, function selectCb(err, results, fields){
            if (err) {
                console.log("ERROR: " + err.message);
                throw err;
            }
            console.log("Got "+results.length+" Rows:");
            console.log(results);
            //console.log("The meta data about the columns:");
            //console.log(fields);

            }
        );
}

var testDB = function(connection){
    connection.connect();
    makeTable(connection, 'test1');
    //makeColumn(connection, 'table2', 'winner');
    insertData(connection, 'test1', {winner: '2', excerpt: '4', condition: '9'});
    getData(connection, 'test1');
    connection.end();
}

//testDB(connection);



app.post('/data', function(req, res){
    var obj = req.body;
    var toStore;
    listProps(obj, function(prop){
        if (prop.indexOf('/') != -1){
            //console.log(prop)
            var conditionArray = prop.split('/');
            var condition = conditionArray[3];
            var participantType = conditionArray[1];
            var excerpt = conditionArray[2][conditionArray[2].length - 1];
            if (conditionArray[conditionArray.length - 1] === 'part2'){
                var part = '2';
            }
            else {
                var part = '1';
            }
            var winner = obj[prop];
            toStore = {condition: condition, winner: winner, participantType: participantType, excerpt: excerpt, part: part};
        }
        else {
            toStore[prop] = obj[prop];
        }
            
    });
    db.data.insert(toStore);
    var connection = mysql.createConnection(
        {
          host     : 'sql5.freemysqlhosting.net',
          port     : '3306',
          user     : 'sql586865',
          password : 'rN9!gV3*',
          database : 'sql586865'
        } ); 
    connection.connect();
    insertData(connection, 'test3', toStore);
    getData(connection, 'test3');
    connection.end();
});

var listProps = function(obj, func){
    for (prop in obj){
        if (obj.hasOwnProperty(prop)){
            func(prop);
        }
    }
}


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

//var excerptPointers = {beethovenOne: 'beethovenOneLinks', bachOne: 'bachOneLinks'};

var excerptNames = ['excerpt1', 'excerpt2', 'excerpt3', 'excerpt4', 'excerpt5', 'excerpt6', 'excerpt7', 'excerpt8'];

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
        //console.log('connection to ' + socket.name);
        var condition = nextInArray(conditions);
        //console.log(condition);
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
    //console.log(pagePaths);
    var secondAudioVideo = audioOrVideo === 'audio' ? 'video' : 'audio';
    pagePaths.forEach(function(page, index){
        var orders = [[0,1,2], [1,2,0], [2,1,0], [2,0,1], [0,2,1], [1,0,2]];
        var secondPageOrders = [[1,2,0], [2,0,1], [1,0,2], [0,1,2], [2,1,0], [0,2,1]];
        //console.log(excerpts[excerptPointers[excerpt]]);
        var links = getLinks(excerpts[excerpt][audioOrVideo][length].links, index, orders);
        var secondLinks = getLinks(excerpts[excerpt][secondAudioVideo][length].links, index, secondPageOrders);
        var paths = ['/m/' + excerpt + '/' + String(page), 
                    '/p/' + excerpt + '/' + String(page),
                    '/a/' + excerpt + '/' + String(page)];
        paths.forEach(function(path){
            var root = path.slice(0,2);
            var nextPath = path + '/part2';
            appRender(path, audioOrVideo + 'First' + '.ejs', {links: links, path: path, nextPath: nextPath});
            appRender(nextPath, secondAudioVideo + 'Second' + '.ejs', {links: secondLinks, path: nextPath, nextPath: root + '/thankyou'})
        });
        
    });
    
}

function getAllPages(excerpt){
    getExcerptPages(longVideo, excerpt, 'long', 'video');
    getExcerptPages(shortVideo, excerpt, 'short', 'video');
    getExcerptPages(longAudio, excerpt, 'long', 'audio');
    getExcerptPages(shortAudio, excerpt, 'short', 'audio');

}

excerptNames.forEach(function(excerptName){
    getAllPages(excerptName);
});


// getExcerptPages(longVideo, 'beethoven', 'long', 'video');
// getExcerptPages(longAudio, 'beethoven', 'long', 'audio');

function getLinks(arrayOfLinks, index, orders){
    return orders[index].map(function(ind){
        return arrayOfLinks[ind];
    });
}

// function generateOrder(arrayOfLinks){
//     var order = randomFromArrayAndDelete(orders);
//     return {links: 
//             [arrayOfLinks[order[0]], arrayOfLinks[order[1]], arrayOfLinks[order[2]]]
//             }
// }

appGet('/test.html', '/test.html')
appGet('/', '/home.html');
appGet('/home.js', '/home.js');
appGet("/node_modules/socket.io/node_modules/socket.io-client/socket.io.js", "/node_modules/socket.io/node_modules/socket.io-client/socket.io.js")
appGet('/p', '/excerpts.html');
appGet('/a', '/excerpts.html');
appGet('/m', '/excerpts.html');
appGet('/data.db', '/data.db');
// appGet('/test.php', '/test.php');
appGet('/a/thankyou', '/thankyou.html');
appGet('/m/thankyou', '/thankyou.html');
appGet('/p/thankyou', '/thankyou.html');


// function subForm(){
//         $.ajax({
//             url:'/data',
//             type:'post',
//             data:$('#myForm').serialize(),
//             success:function(){
//                 alert("worked");
//             }
//         });
//     }


// $.ajax({
//                 url:'/Person/Edit/@Model.Id/',
//                 type:'post',
//                 data:$('#myForm').serialize(),
//             });

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