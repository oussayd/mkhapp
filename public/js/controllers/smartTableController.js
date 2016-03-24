(function () {
    "use strict";

    var app = angular.module("amazonPrices");

    app.controller("demoController", demoController);
    demoController.$inject = ["NgTableParams"];

    function demoController(NgTableParams) {
        var self = this;
        self.tableParams = new NgTableParams({}, {
            dataset: [{
                    name: "Moroni",
                    age: 50
                },
                {
                    name: "Simon",
                    age: 43
                },
                {
                    name: "Jacob",
                    age: 27
                },
                {
                    name: "Nephi",
                    age: 29
                },
                {
                    name: "Christian",
                    age: 34
                },
                {
                    name: "Tiancum",
                    age: 43
                },
                {
                    name: "Jacob",
                    age: 27
                }
            ]
        });
    }
})();