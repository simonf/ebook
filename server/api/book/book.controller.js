'use strict';

var _ = require('lodash');
var books = require('../db/db');
var Q = require('q');

exports.updateBook = function(req,res) {
	var id = req.body.id;
	// different kinds of updates need to be handled in different ways
	try {	
		if(req.body.candidate == 'N') {
			Q.all([books.setCandidate(id,'N'),books.ignoreAllUnmatchedCandidatesForBook(id)])
			.then(function(){
				res.send(200);
			});
		} else if(req.body.candidate == 'Y') {
			Q.all([books.setCandidate(id,'Y'), books.resetAllCandidatesForBook(id)]).
			then(function(){
				res.send(200);
			});
		}
	}catch(err) {
		console.log(err);
		res.send(500);
	}
};

exports.ignore = function(req,res) {
	var b1 = req.body.book1;
	var b2 = req.body.book2;
	books.ignore(b1,b2).then(function() {
		res.send(200);
	});
};

exports.match = function(req,res) {
	var b1 = req.body.book1;
	var b2 = req.body.book2;
	books.match(b1,b2).then(function(){
		res.send(200);
	});
};

// Get list of paths
exports.paths = function(req, res) {
	books.paths().then(function(data) {
		res.json(data);
	},
	function(err){
		console.log(err);
		res.send(500);
	});
};

exports.candidates = function(req,res) {
	var id = req.params.id;
	books.candidates(id).then(function(data) {
		res.json(data);
	},
	function(err){
		console.log(err);
		res.send(500);
	});
};

exports.book = function(req,res) {
	var id = req.params.id;
	books.bookDetail(id).then(function(data) {
		res.json(data[0]);
	},
	function(err) {
		console.log(err);
		res.send(500);
	});
};