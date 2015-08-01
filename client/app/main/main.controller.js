'use strict';

angular.module('guiApp')
  .controller('MainCtrl', ['$scope','$http','$q', 'apiClient', function ($scope, $http, $q, apiClient) {
		var self = this;
		self.loaded = false;
    $scope.books = [];
		$scope.displayedBooks=[];
		$scope.numPaths = 0;
		$scope.candidates = [];
		$scope.displayedCandidates = [];
		$scope.selectedBook = null;
		$scope.reverseMatches = true;
		
		$scope.showBooks = function() {
		  $scope.pathsPromise = apiClient.getUnmatchedPathsPromise().then(function(data) {
		    $scope.books = data;
				$scope.selectedBook = null;
				$scope.candidates = [];
				$scope.displayedCandidates=[];
				if(!self.loaded) {
					$scope.displayedBooks = [].concat($scope.books);
					self.loaded = true;
				}
				$scope.numPaths = $scope.displayedBooks.length;
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
				if(unmatchedCount <= 0 ) { 
					self.markBookAsFullyMatched($scope.selectedBook.id);
				}
				if(unmatchedCount <= 0 || $scope.reverseMatches === true) {
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
	
	
