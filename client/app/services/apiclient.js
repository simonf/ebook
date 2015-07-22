'use strict';

angular.module('guiApp')
.factory('apiClient',['$http','$q',function($http,$q){
	return {
		getUnmatchedPathsPromise: getUnmatchedPathsPromise,
		getBookDetailPromise: getBookDetailPromise
	};
	
	function getUnmatchedPathsPromise() {
		console.log("called");
		return $http.get('/api/books');
	}
	
	function getBookDetailPromise(id) {
		return $http.get('/api/books/book/'+id);
	}
	
}]);