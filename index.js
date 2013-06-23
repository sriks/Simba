var geoHash = require('./geohash');
var DbService = require('./dbservice').DbService;
var express = require('express');
var app = express();
app.use(express.bodyParser());

// Instance for DB Server
var dbServer;
var allowedZipprAlpha = 'ABDFGHIJKLMNOPQRSTUVWXYZ'.split('');
var allowedZipprNum   = '0123456789'.split('');
if(app)
    console.log("created app");

function resultCallback(err, res) {
}

function errorResponse() {
    return {"ok":false}
}

function okResponse() {
    return {"ok":true}
}

function createResponse(err, result) {
    var resp;
    if(err)
        resp = errorResponse();
    else
        resp = okResponse();
    
    resp["result"] = result;
    return resp;
}

function createZipprId(data) {
    // TODO: Check duplicate zipprs
    var lat = data.geo.lat;
    var long = data.geo.long;
    console.log("creating zipperid from "+JSON.stringify(data.geo));
    var geohash = geoHash.createGeoHash(lat,long);
    var salt = geohash + 'w' + Date.now();
    var size = salt.length;
    console.log("salt is:"+salt);
    var alpha = [];
    var indx = 0;
    do {
        var s = salt[Math.floor(Math.random() * size)];
        if((s >= 0) && (s <= 9)) {
            alpha[indx++] = allowedZipprAlpha[s];    
        } else {
            continue;
        }
    } while(alpha.length < 4)
    
    var num = [];
    indx = 0; 
    do {
        var s = salt[Math.floor(Math.random() * size)];
        if((s >= 0) && (s <= 9)) {
            num[indx++] = allowedZipprNum[s];    
        } else {
            continue;
        }
    } while(num.length < 3)
    
    var id = alpha.join('')+num.join('');
    console.log("uid is :"+id);
    return id;
}

app.get('/a0', function(req, res) {
    console.log("on path /");
    res.send('Hello world!');
});

/*!
GET 
Provides information about a zippr. Provides info about all zipprs
if zippr value is "all"
**/
app.get('/a0/zippr=:zippr', function(req, res) {
    console.log("getting zippr info for "+req.params.zippr);
    if(req.params.zippr === "all") {
        dbServer.allZipprs(function(err, result) {
            res.send(createResponse(err,result));
        });
    } else {
        dbServer.zipprInfo(req.params.zippr, function(err, result) {
            res.send(createResponse(err,result));
        }); 
    }
});

/*!
GET
Provides all categories
**/
app.get('/a0/categories', function(req, res) {
   console.log("/categories"); 
    dbServer.categories(function(err, result) {
        res.send(createResponse(err, result));
    });
});

/*!
GET
Provides all zipprs in a category
**/
app.get('/a0/category=:category', function(req,res) {
    console.log("/category for "+req.params.category); 
    var category = req.params.category;
    dbServer.zipprsForCategory(category, function(err, result) {
        res.send(createResponse(err, result));
    });
});

/*!
POST 
Creates a zippr from supplied POST body data

POST data: 
{
    "geo":{"lat":37.76893497,
           "long":-122.42284884},
           
    "title":"Coffee day",
    "locality":"Jublee Hills",
    "meta":["meetmehere"],
    "category":["food"],
    "keywords":["cofee"]
}
**/
app.post('/a0/createzippr', function(req, res) {
    console.log("/createzippr");
    console.log("post data:"+req.body);
    var payload = req.body;
    var zipprid = createZipprId(payload);
    payload["zippr"] = zipprid;
    console.log("json is:"+JSON.stringify(payload));
    dbServer.createZippr(payload, function(err, result){
        var resp = createResponse(err, result);
        res.send(resp);
    });
});

// Startup procedure
// TODO: Cache the DB connection rather than creating it.
dbServer = new DbService('127.0.0.1', 6565);
dbServer.ping();
app.listen(6504);
        
