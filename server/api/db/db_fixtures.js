//database.js
var mysql = require('mysql');
var Q = require('q');

module.exports = { 
  connect: connect,
  insertBooks: insertBooks,
  deleteBooks: deleteBooks,
  insertNearness: insertNearness,
  deleteNearness: deleteNearness,
  getTestBooks: getTestBooks,
  getTestNearness: getTestNearness,
	getInsertedIds: getInsertedIds,
	zeroIds: zeroIds
};

var insertedIds = [];
var minInsertedId = 1000000;

function zeroIds() {
	insertedIds = [];
}

function getInsertedIds() {
	return insertedIds;
}

function addInsertedId(id) {
	insertedIds.push(id);
	minInsertedId = Math.min(minInsertedId,id);
}

function insertBooks() {
	var p1 = getPromiseForQuery(
		'insert into books(filename,path,size,type,candidate) values(?,?,?,?,?)',
		['aaa','/bbb',10,'epub','Y'])
	.then(function(res){
		addInsertedId(res.insertId);
		return res.insertId;
	});
	var p2 = getPromiseForQuery(
		'insert into books(filename,path,size,type,candidate) values(?,?,?,?,?)',
		['zzz','/ccc/ddd',15,'epub','Y'])
	.then(function(res){
		addInsertedId(res.insertId);
		return res.insertId;
	});
	return Q.all([p1,p2]);
}

function deleteBooks() {
	if(insertedIds.length<2) {
		throw new Error("No test IDs recorded");
	} 
  return getPromiseForQuery("delete from books where id > ?",[minInsertedId-1]);
}

function insertNearness() {
	if(insertedIds.length<2) {
		throw new Error("No test IDs recorded");
	} 
  var p1 = getPromiseForQuery("insert into nearness(book1_id,book2_id,weight1, weight2) values(?,?,?,?)",[insertedIds[0],insertedIds[1],75,0]);
  var p2 = getPromiseForQuery("insert into nearness(book1_id,book2_id,weight1, weight2) values(?,?,?,?)",[insertedIds[1],insertedIds[0],75,0]);
  return Q.all([p1,p2]);
}

function deleteNearness() {
	if(insertedIds.length<2) {
		throw new Error("No test IDs recorded");
	} 
  return getPromiseForQuery("delete from nearness where book1_id > ?",[minInsertedId - 1]);
}

function getTestBooks() {
  return getPromiseForQuery("select * from books where id > ?",[minInsertedId - 1]);
}

function getTestNearness() {
  return getPromiseForQuery("select * from nearness where book1_id > ?",[minInsertedId - 1]);
}

function getPromiseForQuery(qry,values) {
  var deferred = Q.defer();
  var connection = connect();
  if(values) {
		connection.query(qry,values,function(err,rows,fields) {
	    if(err) deferred.reject(new Error(err));
	    else {
				deferred.resolve(rows);
				connection.end();
	    }
		});
  } else {
		connection.query(qry, function(err,rows,fields) {
	    if(err) deferred.reject(new Error(err));
	    else {
				deferred.resolve(rows);
				connection.end();
	    }
		});
  }
  return deferred.promise;
}

function connect() {
  var connection = mysql.createConnection({
    host: 'localhost',
	user: 'simon',
	password: 'simon',
	database: 'books'
  });
  connection.connect();
  return connection;
}
