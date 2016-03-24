var myApp = angular.module('amazonPrices', ['ngTable', 'ngRoute', 'ui.bootstrap', 'ui-rangeSlider', 'angularGrid'])
    .config(function ($routeProvider) {
        $routeProvider

        // route for the home page
            .when('/', {
            templateUrl: 'templates/ngTable.html',
            controller: 'amazonNgTableController'
        })

        .when('/ngGrid', {
            templateUrl: 'templates/ngGrid.html',
            controller: 'amazonNgTableController'
        })

        // route for the contact page
        .when('/ngTable', {
                templateUrl: 'templates/ngTable.html',
                controller: 'amazonNgTableController'
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