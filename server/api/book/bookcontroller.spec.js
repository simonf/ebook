'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Q = require('q');
var fixtures = require('../db/db_fixtures');

describe('HTTP methods',function(){
  before(function(done) {
		// Insert books, wait to ensure IDs are recorded, then insert nearness rows
		fixtures.insertBooks().then(
			function(ids) {
				fixtures.insertNearness().then(
					function(){
						done();
					});
			}
		);
  });

	after(function(done) {
		// delete books and nearness rows
		var p1 = fixtures.deleteBooks();
		var p2 = fixtures.deleteNearness();
		Q.all([p1,p2]).then(
			function(){ 
				done(); 
		});
	});	

	describe('GET /api/books', function() {
		this.timeout(10000);
	  it('should respond with JSON array', function(done) {
	    request(app)
	      .get('/api/books')
	      .expect(200)
	      .expect('Content-Type', /json/)
	      .end(function(err, res) {
	        if (err) return done(err);
	        res.body.should.be.instanceof(Array);
	        done();
	      });
	  });
	});

	describe('GET /book/:id', function() {
		this.timeout(10000);
	  it('should return detail about a book', function(done) {
	    request(app)
	      .get('/api/books/book/1')
	      .expect(200)
	      .expect('Content-Type', /json/)
	      .end(function(err, res) {
	        if (err) return done(err);
	        res.body.candidate.should.equal('Y');
	        done();
	      });
	  });
	});

	describe('GET /candidates/:id', function() {	
		this.timeout(10000);
	  it('should return candidate matches for a book', function(done) {
			var ids = fixtures.getInsertedIds();
			ids.length.should.equal(2);
	    request(app)
	      .get('/api/books/candidates/'+ids[0])
	      .expect(200)
	      .expect('Content-Type', /json/)
	      .end(function(err, res) {
	        if (err) return done(err);
	        res.body.should.be.instanceof(Array);
					res.body.length.should.equal(1);
	        done();
	      });
	  });
	});

	describe('POST /ignore',function(){
		it('should ignore a marked candidate', function(done){
			var ids = fixtures.getInsertedIds();
			var before_cnt,after_cnt;
	    request(app)
	      .get('/api/books/candidates/'+ids[0])
				.end(function(err, res) {
	        if (err) return done(err);
					before_cnt = res.body.length;
					var n = res.body[0];
					request(app)
						.post('/api/books/ignore')
					  .send({book1: n.book1_id, book2: n.book2_id})
						.end(function(err,res){
							if(err) return done(err);
							request(app)
							.get('/api/books/candidates/'+ids[0])
							.end(function(err,res){
								if(err) return done(err);
								after_cnt = res.body.length;
								var diff = before_cnt - after_cnt;
								diff.should.equal(1);
								done();
							});
						});
	      });			
		});
	});

	describe('POST /book',function(){
		it('should update a book', function(done){
			var ids = fixtures.getInsertedIds();
	    request(app)
      .get('/api/books/book/'+ids[0])
      .end(function(err, res) {
        if (err) return done(err);
        res.body.candidate.should.equal('Y');
				request(app)
				.post('/api/books/book')
				.send({id: ids[0], candidate: 'N'})
				.end(function(err,res){
					if(err) return done(err);
					request(app)
					.get('/api/books/book/'+ids[0])
					.end(function(err,res){
						if(err) return done(err);
						res.body.candidate.should.equal('N');
						done();
					});
				});
      });
		});
	});

});

