var fixtures = require('./db_fixtures');
var books = require('./db');
var expect = require('expect');
var Q = require('q');


describe('Book queries', function() {
  // this.timeout(10000);
	
  beforeEach(function(done) {
		fixtures.zeroIds();
		// Insert books, wait to ensure IDs are recorded, then insert nearness rows
		fixtures.insertBooks()
		.then(
			function() {
				fixtures.insertNearness()
				.then(
					function(){
						done();							
				});
			}
		);
  });
	
	afterEach(function(done) {
		// delete books and nearness rows
		var p1 = fixtures.deleteBooks();
		var p2 = fixtures.deleteNearness();
		Q.all([p1,p2]).then(function(){ 
			fixtures.zeroIds();
			done(); 
		});
	});
	
	/*
	 * Ensure that we get some book information back on request
	 */
	  describe('#paths', function() {
		this.timeout(10000);

		it('should return 2 rows if limited to 2', function(done) {
	    books.paths(2).then(
				function(rows) {
					try {
						expect(rows.length).toBe(2);
						expect(rows[0].id).toExist();
						expect(rows[0].fullname).toExist();
						expect(rows[0].cnt).toExist();
						done();
					} catch(e) { done(e); }
				} ,
				function(err) {
					done(err);
				}
	    );
		});
	  });
	
	/*
	 * Ensure that we can retrieve details of a book
	 */
  describe('#bookDetail', function() {
		it('should return a book object', function(done) {
			var ids = fixtures.getInsertedIds();
	    books.bookDetail(ids[0]).then(
				function(books) {
					try {
						expect(books.length).toBeGreaterThan(0);
						expect(books[0].id).toBe(ids[0]);
						expect(books[0].path).toExist();
						expect(books[0].filename).toExist();
						expect(books[0].type).toExist();
						expect(books[0].size).toBeGreaterThan(1);
						done();
					} catch(e) { done(e); }
				},
				function(err){
					done(err);
				}
			);
		});
  });
	
	/*
	 * Ensure we can retrieve potential matches for a book
	 */
  describe('#candidates', function() {
		it('should return a candidate when given a book id', function(done) {
			var ids = fixtures.getInsertedIds();
	    books.candidates(ids[0]).then(function(ca) {
				try {
					expect(ca.length).toBe(1);
					done();
				} catch(e) { done(e); }
	    });
		});
  });
	
	/*
	 * Ensure that we can choose to ignore a candidate match
	 */
  describe('#ignore', function() {
		it('should ignore a candidate identified by integer book IDs', function(done) {
			var ids = fixtures.getInsertedIds();
	    books.ignore(ids[0], ids[1]).then(function() {
				fixtures.getTestNearness().then(function(rows) {
					try {
						expect(rows.length).toBeGreaterThan(0);
						if(rows[0].book1_id == ids[0]) {
							expect(rows[0].matched).toBe('N');
						} else {
							expect(rows[1].matched).toBe('N');
						}
						done();
					} catch(e) { done(e); }
				});
	    });
		});
		
		it('should ignore a candidate identified by string book IDs', function(done) {
			var ids = fixtures.getInsertedIds();
	    books.ignore(ids[0].toString(), ids[1].toString()).then(function() {
				fixtures.getTestNearness().then(function(rows) {
					expect(rows.length).toBeGreaterThan(0);
					if(rows[0].book1_id == ids[0]) {
						expect(rows[0].matched).toBe('N');
					} else {
						expect(rows[1].matched).toBe('N');
					}
					done();
				});
	    });
		});
  });
	
	/* 
	 * Ensure we can record a match between two books, even if they don't exist
	 */
  describe('#match', function() {
		it('should match a candidate identified by integer book IDs', function(done) {
			var ids = fixtures.getInsertedIds();
	    books.match(ids[0], ids[1]).then(function() {
				fixtures.getTestNearness().then(function(rows){
					try {
						expect(rows.length).toBeGreaterThan(0);
						if(rows[0].book1_id == ids[0]) {
							expect(rows[0].matched).toBe('Y');
						} else {
							expect(rows[1].matched).toBe('Y');
						}
						done();	
					} catch(e) { 
						console.log(e);
						done(e); }
				});
			});	
	  });
		
		it('should return as normal if the specified books do not exist',function(done){
			try {
				books.match(-101,-345).then(function(){
					expect(true).toBe(true);
					done();
				});
			} catch(e) {
				console.log(e);
				expect(true).toBe(false);
				done(e);
			}
		});
	});
		
	describe('#setCandidate', function() {
		this.timeout(10000);
		it('should reduce the number of candidates', function(done) {
			var ids = fixtures.getInsertedIds();
			var initial_count = 0;
			var second_count = 0;
			try {
				books.countPaths('Y').then(
					function(rows) {
						expect(rows.length).toBeGreaterThan(0);
						initial_count = rows[0].cnt;
						expect(initial_count).toBeGreaterThan(1);
						return books.setCandidate(ids[0],'N');
				}).then(
					function() {
						return books.countPaths('Y');
				}).then(
					function(lines) {
						expect(lines.length).toBeGreaterThan(0);
						second_count = lines[0].cnt;
						expect(initial_count).toBeGreaterThan(second_count);
						done();
				});							
			} catch(e) {
				console.log(e);
				done(e);
			}
		});
  });
	
});


