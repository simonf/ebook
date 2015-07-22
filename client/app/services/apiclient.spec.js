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
	  $httpBackend.expectGET('/api/books')
	    .respond([{id: 1, fullname: 'abcd', cnt: 2},{id: 2, fullname: 'xyz', cnt: 1}]);
			
		apiClient.getUnmatchedPathsPromise()
		.success(function(books){
			expect(books.length).to.equal(2);
			done();
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
});
