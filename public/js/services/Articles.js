angular.module('amazonPrices').factory('Articles', ['$http', function ($http) {
    return {
        get: function (articleData) {
            console.log(articleData);

            return $http.get('/api/articles', articleData);
        },
        create: function (articleData) {
            console.log(articleData);
            return $http.post('/api/articles', articleData);
        },
        delete: function (id) {
            return $http.delete('/api/articles/' + id);
        }
    }
	}]);