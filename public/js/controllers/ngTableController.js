angular.module('amazonPrices').controller('amazonNgTableController', ['$scope', '$http', 'Articles', 'NgTableParams', function ($scope, $http, Articles, NgTableParams) {
    $scope.loading = true;

    $scope.search = function () {

        var req = {
            method: 'POST',
            url: '/api/articles',
            data: {
                prixMax: $scope.prixMax,
                prixMin: $scope.prixMin,
                indiceMax: $scope.indiceMax,
                indiceMin: $scope.indiceMin,
                limit: $scope.limit,
                versionMax: $scope.versionMax,
                versionMin: $scope.versionMin,
                lastUpdateMax: $scope.lastUpdateMax,
                lastUpdateMin: $scope.lastUpdateMin,
                categoriesList: $scope.categoriesList,
                titre: $scope.titre,
                paysList: $scope.paysList
            }
        }

        $http(req).then(function (rep) {

            $scope.articles = rep.data;
            $scope.tableParams = new NgTableParams({
                count: 200
            }, {
                counts: [100, 200, 500],
                data: rep.data
            });

        });


    };
    // GET =====================================================================
    // when landing on the page, get all articles and show them
    // use the service to get all the articles
    Articles.get().success(function (data) {

        $scope.articles = data;
        $scope.tableParams = new NgTableParams({
            count: 200
        }, {
            counts: [100, 200, 500],
            data: data
        });

    });


	}]);