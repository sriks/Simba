var MongoClient = require('mongodb').MongoClient,
             Server = require('mongodb').Server;

var db;
var col_allzipprs = 'allZipprs';

DbService = function(host, port, options) {
    var mongoClient = new MongoClient(new Server('localhost', 27017));
    mongoClient.open(function(err, mongoClient) {
        
        if(err) {
            console.log("startService() error:"+err);
        } else {
            console.log("startService() success");
            db = mongoClient.db("zippr_test");
        }
      //var db1 = mongoClient.db("mydb");
    });    
}

DbService.prototype.ping = function() {
    console.log("dbservice says hello!")
}

/*!
payload - is a json with all the expected keys. Certain keys may be missing.
callback - return the zippr as a json in callback result param
options - optional, can be used in future enhancements.
**/
DbService.prototype.createZippr = function(payload, callback, options) {
    console.log("payload is "+payload);
    var col = db.collection(col_allzipprs);
    
    col.insert(payload, function(err,res){
        if(!err) {
            console.log("inserted successfully");
            callback(null,payload);
        } else {
            console.log("err:"+err);
            callback(err,{});
        }
    });
}

/*!
Provides info about all zipprs
**/
DbService.prototype.allZipprs = function(callback, options) {
    var col = db.collection(col_allzipprs);
    col.find().toArray(function(err, result) {
        callback(err, result);
    });
}

/*!
Provides information about a zippr.
**/
DbService.prototype.zipprInfo = function(zippr, callback, options) {
    var col = db.collection(col_allzipprs);
    col.find({"zippr":zippr}).toArray(function(err,result) {
        callback(err, result);
    });
}

/*!
Provides all categories
**/
DbService.prototype.categories = function(callback, options) {
    var col = db.collection(col_allzipprs);
    col.find({}, {fields:{"category":1, "_id":0}})
        .toArray(function(err, result) {
        callback(err, result);
    });
}

/*!
Provides zipprs for a category
**/
DbService.prototype.zipprsForCategory = function(category, callback, options) {
    var col = db.collection(col_allzipprs);
    col.find({"category":category}).toArray(function(err, result){
        callback(err, result);
    });
}

exports.DbService = DbService;
