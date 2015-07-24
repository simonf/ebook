'use strict';
//var expect = require('expect')
describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('guiApp'));

  var MainCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
		// response to showBooks back end call
	  $httpBackend.expectGET('/api/books')
	    .respond([{id: 1, fullname: 'abcd', cnt: 2},{id: 2, fullname: 'xyz', cnt: 1}]);

    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

	//   it('should fetch some books', function () {
	//   	$httpBackend.flush();
	//     expect(scope.books.length).to.equal(2);
	// 	expect(scope.displayedBooks.length).to.equal(2);
	// 	expect(scope.displayedBooks[0].cnt).to.equal(2);
	//
	//   });
	//
	//
	//   it('should fetch a candidate for a book', function () {
	// 	// response to showMatches back end calls
	// 	$httpBackend.expectGET('/api/books/book/1')
	// 	.respond({id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
	// 	size: 12345, type: 'epub', candidate: 'Y'});
	//
	// 	$httpBackend.expectGET('/api/books/candidates/1')
	// 	.respond([{book1_id: 1, book2_id: 2, weight1: 85, weight2: null, matched: null},
	// 		{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null}]);
	//
	//   	scope.showMatches('1');
	//
	//     $httpBackend.flush();
	//     expect(scope.selectedBook.type).to.equal('epub');
	// 	expect(scope.candidates.length).to.equal(2);
	// 	expect(scope.displayedCandidates.length).to.equal(2);
	//   });
	//
	// it('should mark candidates to ignore',function(){
	// 	$httpBackend.flush();
	//
	// 	// set up test data
	// 	scope.reverseMatches = false;
	// 	scope.candidates = [
	// 		{book1_id: 1, book2_id: 2, weight1: 85, weight2: null, matched: null, isSelected: true},
	// 		{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null}];
	//
	// 	scope.selectedBook = {
	// 		id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
	// 		size: 12345, type: 'epub', candidate: 'Y'};
	//
	// 	// response to updateCandidates back end call
	// 	$httpBackend.expectPOST('/api/books/ignore').respond(200);
	//
	// 	// response to showMatches back end calls
	// 	$httpBackend.expectGET('/api/books/book/1')
	// 	.respond({id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
	// 	size: 12345, type: 'epub', candidate: 'Y'});
	//
	// 	$httpBackend.expectGET('/api/books/candidates/1')
	// 	.respond([{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null}]);
	//
	// 	expect(scope.selectedBook.id).to.equal(1);
	//
	// 	scope.ignoreSelectedCandidates();
	//
	// 	$httpBackend.flush();
	//
	// 	expect(scope.displayedCandidates.length).to.equal(1);
	//
	// });
	//
	it('should send twice as many POSTs when reverseMatches is true', function(done){
		$httpBackend.flush();
		console.log("A");
		// set up test data
		scope.reverseMatches = true;
		scope.candidates = [
			{book1_id: 1, book2_id: 2, weight1: 85, weight2: null, matched: null, isSelected: true},
			{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null}];
		
		scope.selectedBook = {
			id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
			size: 12345, type: 'epub', candidate: 'Y'};
		
		// response to updateCandidates back end call
		$httpBackend.expectPOST('/api/books/ignore').respond(200);
		$httpBackend.expectPOST('/api/books/ignore').respond(200);
		
		// response to markBookAsFullyMatched
		$httpBackend.expectPOST('/api/books/book').respond(200);

		// - not expected when apiClient.config.cachePaths == true
		// $httpBackend.expectGET('/api/books')
		// .respond([{id: 1, fullname: 'abcd', cnt: 1},{id: 2, fullname: 'xyz', cnt: 1}]);
		
		scope.ignoreSelectedCandidates()
		.then(function(){
			expect(scope.displayedBooks[0].cnt).to.equal(1);
			done();
		});

		$httpBackend.flush();

	});

	// it('should mark a book as fully matched when it has no candidates',function(){
	// 	$httpBackend.flush();
	// 	// set up test data
	// 	scope.reverseMatches = false;
	//
	// 	scope.candidates = [
	// 		{book1_id: 1, book2_id: 2, weight1: 85, weight2: null, matched: null, isSelected: true},
	// 		{book1_id: 1, book2_id: 3, weight1: 87, weight2: null, matched: null, isSelected: true}];
	//
	// 	scope.selectedBook = {
	// 		id: 1, filename: 'test.epub', path: '/Calibre Library/Unknown/test.epub',
	// 		size: 12345, type: 'epub', candidate: 'Y'};
	//
	// 	// response to updateCandidates back end call
	// 	$httpBackend.expectPOST('/api/books/match').respond(200);
	//
	// 	// response to second updateCandidates back end call
	// 	$httpBackend.expectPOST('/api/books/match').respond(200);
	//
	// 	// response to updating a book as fully matched
	// 	$httpBackend.expectPOST('/api/books/book').respond(200);
	//
	// 	// response to re-issuing of showBooks API call
	// 	// - not expected when apiClient.config.cachePaths == true
	//   	// $httpBackend.expectGET('/api/books')
	//   	//     .respond([{id: 2, fullname: 'xyz', cnt: 1}]);
	//
	// 	scope.matchSelectedCandidates();
	//
	// 	$httpBackend.flush();
	//
	// 	expect(scope.displayedCandidates.length).to.equal(0);
	// 	expect(scope.displayedBooks[0].cnt).to.equal(1);
	// });

});
