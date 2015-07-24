'use strict';

angular.module('guiApp')
  .controller('MainCtrl', ['$scope','$http','$q', 'apiClient', function ($scope, $http, $q, apiClient) {
		var self = this;
    $scope.books = [];
		$scope.displayedBooks=[];
		$scope.numPaths = 0;
		$scope.candidates = [];
		$scope.displayedCandidates = [];
		$scope.selectedBook = null;
		$scope.reverseMatches = true;
		
		$scope.showBooks = function() {
			console.log("Cache: "+apiClient.cache.paths);
		  $scope.pathsPromise = apiClient.getUnmatchedPathsPromise().then(function(books) {
		    $scope.books = books;
				$scope.displayedBooks = [].concat($scope.books);
				$scope.numPaths = $scope.displayedBooks.length;
				$scope.selectedBook = null;
				$scope.candidates = [];
				$scope.displayedCandidates=[];
				console.log("A: Cache: "+apiClient.cache.paths);
		  });
		};		
		
		$scope.showMatches = function(id) {
			// two independent calls to the API - no need to coordinate them
			// First, get more detail about the selected book
			apiClient.getBookDetailPromise(id).success(function(book) {
				$scope.selectedBook = book;
			});
			// In parallel, find all pre-calculated matches 
			$scope.matchesPromise = 
				apiClient.getCandidateMatchesPromise(id)
				.success(function(candidates){
					$scope.candidates = candidates;
					$scope.displayedCandidates = [].concat($scope.candidates);
			});
		};
		
		$scope.ignoreSelectedCandidates = function() {
			return self.updateCandidates('ignore');
		};
		
		$scope.matchSelectedCandidates = function() {
			return self.updateCandidates('match');
		};
		
		self.updateCandidates = function(api) {
			// Get the selected candidates
			var toProcess = $scope.candidates.filter(function(candidate) { 
				return candidate.isSelected;
			});
			
			// Will any be left after processing?
			var unmatchedCount = $scope.candidates.length - toProcess.length;

			
			// Call the API to update each candidate one at a time
			var promiseArray = _.flatten(toProcess.map(function(ig) { 
				var func = apiClient.postIgnoreCandidatePromise;
				if(api=='match') func = apiClient.postMatchCandidatePromise;
				if($scope.reverseMatches === true) {
					return [ func({book1: ig.book1_id, book2: ig.book2_id}),
									 func({book1: ig.book2_id, book2: ig.book1_id}) ];
				} else {
					return [ func({book1: ig.book1_id, book2: ig.book2_id}) ];
				}
			}));
			
			return $q.all(promiseArray).then(function(){
				// If there are no more candidate matches for this book, mark it as fully matched
				// and re-query. Also re-query if reverseMatches is true, because we will have 
				// changed the count of candidates for other books
				//
				console.log("B: Cache: "+apiClient.cache.paths);
				if(unmatchedCount <= 0 || $scope.reverseMatches === true) { 
					console.log("Marking book as fully matched");
					self.markBookAsFullyMatched($scope.selectedBook.id);
					console.log("C: Cache: "+apiClient.cache.paths);
					$scope.showBooks();
				} else { // some unmatched candidates remain - requery & redisplay
					$scope.showMatches($scope.selectedBook.id);
					// Update the unmatched count for the selected book in the main list
					self.setCandidateCount($scope.selectedBook.id,unmatchedCount);
				}
				
			});
		};
		
		self.markBookAsFullyMatched = function(id) {
			$http.post('/api/books/book',{id: id, candidate: 'N'});
			console.log("Cache: "+apiClient.cache.paths);
		};
		
		self.setCandidateCount = function(bookid,numCandidates) {
			for(var c in $scope.books) {
				if(c.id === bookid) {
					c.cnt = numCandidates;
					break;
				}
			}
		};
		$scope.showBooks();
  }]);
	
	
