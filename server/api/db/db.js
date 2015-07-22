var mysql = require('mysql');
var Q = require('q');

module.exports = {
  paths: paths,
	countPaths: countPaths,
  bookDetail: bookDetail,
  candidates: candidates,
  ignore: ignore,
  match: match,
  setCandidate: setCandidate,
	ignoreAllUnmatchedCandidatesForBook: ignoreAllUnmatchedCandidatesForBook,
	resetCandidatesForBook: resetCandidatesForBook
};


function ignoreAllUnmatchedCandidatesForBook(id) {
    var qry = "update nearness set matched = ? where matched = NULL and book1_id = ?";
    return getPromiseForQuery(qry,['N',id]);
}

function resetCandidatesForBook(id) {
    var qry = "update nearness set matched = NULL where book1_id = ?";
    return getPromiseForQuery(qry,['N',id]);
}


function ignore(b1, b2) {
    return updateNearness('N',b1,b2);
}

function match(b1,b2) {
    return updateNearness('Y',b1,b2);
}

function updateNearness(tgt,b1,b2) {
    var qry = "update nearness set matched = ? where book1_id = ? and book2_id = ?";
    return getPromiseForQuery(qry,[tgt,b1,b2]);	
}

function candidates(id, limit) {
	var qry = "select n.book1_id, n.book2_id, n.weight1 as weight, b.path, b.filename, b.size, b.type from nearness n, books b where n.matched is null and n.book1_id = ? and n.book2_id = b.id and b.candidate='Y' order by n.weight1";
	if(limit) {
		qry += " limit "+limit;
	}
	return getPromiseForQuery(qry,[id]);
}

function paths(limit) {
  var qry = "select n.book1_id as id, concat_ws('/',b.path,b.filename) as fullname, count(book2_id) as cnt from nearness n, books b where n.matched is null and n.book1_id = b.id and b.candidate='Y' group by n.book1_id order by fullname asc";
  if(limit) {
    qry += " limit "+limit;
  }
	return getPromiseForQuery(qry);
}

function countPaths(status) {
	var qry = "select count(*) as cnt from books where candidate = ?";
	return getPromiseForQuery(qry,[status]);
}

function bookDetail(id) {
  var qry = "select * from books where id = ?";
  return getPromiseForQuery(qry,[id]);
}

function updateCandidate(id1, id2, matched_value) {
  var qry = "update nearness set matched = ? where book1_id = ? and book2_id = ?";
  return getPromiseForQuery(qry,[matched_value, id1, id2]);
}

function setCandidate(id,candidate) {
  var qry = "update books set candidate = ? where id = ?";
  return getPromiseForQuery(qry,[candidate,id]);
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
