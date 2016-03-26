angular.module('amazonPrices').controller('amazonNgTableDealsController', ['$scope', '$http', 'Deals', 'NgTableParams', function ($scope, $http, Deals, NgTableParams) {
    $scope.loading = true;


    // set available range
    $scope.minPrice = 100;
    $scope.maxPrice = 999;

    // default the user's values to the available range
    $scope.userMinPrice = $scope.minPrice;
    $scope.userMaxPrice = $scope.maxPrice;

    $scope.search = function () {

        var req = {
            method: 'POST',
            url: '/api/deals',
            data: {
                prixMax: $scope.prixMax,
                prixMin: $scope.prixMin,
                indiceMax: $scope.indiceMax,
                indiceMin: $scope.indiceMin,
                reductionMax: $scope.reductionMax,
                reductionMin: $scope.reductionMin,
                reductionGlMax: $scope.reductionGlMax,
                reductionGlMin: $scope.reductionGlMin,
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
                count: 100
            }, {
                counts: [100, 200, 500],
                data: rep.data
            });

        });


    };
    // GET =====================================================================
    // when landing on the page, get all articles and show them
    // use the service to get all the articles
    Deals.get().success(function (data) {

        $scope.articles = data;
        $scope.tableParams = new NgTableParams({
            count: 100
        }, {
            counts: [100, 200, 500],
            data: data
        });

    });


	}]);