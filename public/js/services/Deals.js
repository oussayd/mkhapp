angular.module('amazonPrices').factory('Deals', ['$http', function ($http) {
    return {
        get: function (articleData) {
            console.log(articleData);

            return $http.get('/api/deals', articleData);
        },
        create: function (articleData) {
            console.log(articleData);
            return $http.post('/api/deals', articleData);
        },
        delete: function (id) {
            return $http.delete('/api/deals/' + id);
        }
    }
	}]);