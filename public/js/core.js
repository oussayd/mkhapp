var myApp = angular.module('amazonPrices', ['ngTable', 'ngRoute', 'ui.bootstrap', 'ui-rangeSlider', 'angularGrid', 'angular-duration-format', 'yaru22.angular-timeago'])
    .config(function ($routeProvider) {
        $routeProvider

        // route for the home page
            .when('/', {
            templateUrl: 'templates/ngTableDeals.html',
            controller: 'amazonNgTableDealsController'
        })

        .when('/ngGrid', {
            templateUrl: 'templates/ngGrid.html',
            controller: 'amazonNgTableDealsController'
        })

        // route for the contact page
        .when('/ngTable', {
                templateUrl: 'templates/ngTable.html',
                controller: 'amazonNgTableController'
            })
            .when('/ngTableDeals', {
                templateUrl: 'templates/ngTableDeals.html',
                controller: 'amazonNgTableDealsController'
            })
            .otherwise({
                redirectTo: '/'
            });

    });;

// create the controller and inject Angular's $scope
myApp.controller('mainController', function ($scope) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';
});