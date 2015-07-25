'use strict';

describe('Service: apiClient', function () {

  // load the controller's module
  beforeEach(module('guiApp'));

  var apiClient,
	$httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $injector) {
    $httpBackend = _$httpBackend_;
		apiClient = $injector.get('apiClient');
  }));

	  it('should fetch some books', function (done) {
		apiClient.config.cachePaths = false;
	  $httpBackend.expectGET('/api/books')
	    .respond([{id: 1, fullname: 'abcd', cnt: 2},{id: 2, fullname: 'xyz', cnt: 1}]);

		apiClient.getUnmatchedPathsPromise()
		.then(function(books){
			expect(books.length).to.equal(2);
			done();
		});

		$httpBackend.flush();
	});

	  it('should cache books', function (done) {
		apiClient.config.cachePaths = true;
	  $httpBackend.expectGET('/api/books')
	    .respond([{id: 1, fullname: 'abcd', cnt: 2},{id: 2, fullname: 'xyz', cnt: 1}]);

		apiClient.getUnmatchedPathsPromise()
		.then(function(books){
			expect(books.length).to.equal(2);
			apiClient.getUnmatchedPathsPromise()
			.then(function(ba){
				expect(ba.length).to.equal(2);
				done();
			});
		});

		$httpBackend.flush();
	});

	it('should get book detail',function(done){
		$httpBackend.expectGET('/api/books/book/1')
		.respond({id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
		size: 12345, type: 'epub', candidate: 'Y'});

		apiClient.getBookDetailPromise(1).success(function(data){
			expect(data.id).to.equal(1);
			done();
		});

		$httpBackend.flush();
	});

	  it('should fetch candidate matches for a book', function (done) {
		// response to showMatches back end calls
		$httpBackend.expectGET('/api/books/candidates/1')
		.respond([{book1_id: 1, book2_id: 2, weight1: 85, weight2: null, matched: null},
			{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null}]);

		apiClient.getCandidateMatchesPromise(1).success(function(data){
			expect(data.length).to.equal(2);
			done();
		});

		$httpBackend.flush();
	});

	it('should ignore a candidate',function(done){
		$httpBackend.expectPOST('/api/books/ignore').respond(200);
		var c = {book1: 1, book2: 2};
		apiClient.postIgnoreCandidatePromise(c).success(function(data,status,headers){
			expect(status).to.equal(200);
			done();
		});
		$httpBackend.flush();
	});

	it('should match a candidate',function(done){
		$httpBackend.expectPOST('/api/books/match').respond(200);
		var c = {book1: 1, book2: 2};
		apiClient.postMatchCandidatePromise(c).success(function(data,status,headers){
			expect(status).to.equal(200);
			done();
		});
		$httpBackend.flush();
	});


});
