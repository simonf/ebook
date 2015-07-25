'use strict';

angular.module('guiApp')
.factory('apiClient',['$http','$q',function($http,$q){
	var client = {
		cache:{ paths:[]},
		config: {
			cachePaths: true,
			dirtyPaths: false
		},
		getUnmatchedPathsPromise: getUnmatchedPathsPromise,
		getBookDetailPromise: getBookDetailPromise,
		getCandidateMatchesPromise: getCandidateMatchesPromise,
		postIgnoreCandidatePromise: postIgnoreCandidatePromise,
		postMatchCandidatePromise: postMatchCandidatePromise
	};
	
	// console.log("Initialised apiClient");
	return client;
	
	// wrap $http call in a regular promises so we can return a cached value if available
	function getUnmatchedPathsPromise() {
		// showCache("gUPP");
		var defer = $q.defer();
		if(client.config.cachePaths && client.cache.paths.length > 0) {
			// console.log("cached");
			defer.resolve(client.cache.paths);
		} else {
			// console.log("http");
			$http.get('/api/books').success(function(pathArray){
				if(client.config.cachePaths) {
					client.cache.paths = pathArray;
					// console.log("Cached: "+client.cache.paths);
				} else {
					console.log("Not caching");
				}
				defer.resolve(pathArray);
			}).error(function(data,status,headers){
				console.log(status,data);
				defer.reject(status);
			});
		}
		return defer.promise;
	}
	
	function getBookDetailPromise(id) {
		return $http.get('/api/books/book/'+id);
	}
	
	function getCandidateMatchesPromise(id) {
		return $http.get('/api/books/candidates/'+id);
	}
	
	function postIgnoreCandidatePromise(c) {
		adjustPathCounts(c);
		return $http.post('/api/books/ignore',c);
	}

	function postMatchCandidatePromise(c) {
		adjustPathCounts(c);
		return $http.post('/api/books/match',c);
	}
	
	function adjustPathCounts(c) {
		// keep cached paths in sync
		if(client.config.cachePaths && client.cache.paths.length > 0) {
			decrementPathCount(c.book1);
			decrementPathCount(c.book2);
		}		
	}

	function decrementPathCount(id) {
		var ndx = _.findIndex(client.cache.paths,function(entry){return entry.id === id});
		if(ndx > -1) {
			client.cache.paths[ndx].cnt-=1;
			if(client.cache.paths[ndx].cnt===0) {
				client.cache.paths.splice(ndx,1);
			}
		}
	}
	
	// function showCache(msg) {
	// 	console.log(msg+". Cache: "+client.cache.paths);
	// }
}]);