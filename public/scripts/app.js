'use strict';

angular.module('app', []);

angular.module('app')
  .controller('TodoCtrl', function ($scope, TodoSvc) {
    $scope.todos = [{ title: 'Get paper' }, { title: 'Mail rent check' }];

    $scope.refresh = function () {
      TodoSvc.fetch()
        .then(function (todos) {
          $scope.todos = todos.data;
        });
    }

    $scope.addTodo = function (todo) {
      if (todo._id) {
        TodoSvc.update(todo)
          .then(function () {
            $scope.newTodo = {};
            $scope.refresh();
          });
      } else {
        TodoSvc.add($scope.newTodo)
          .then(function (response) {
            console.log(response.data.errors);
            if (response && response.data && response.data.errors && response.data.errors.length > 0) {
              $scope.newTodo.email = response.data.errors[0];

            } else {
              $scope.newTodo = {};
              $scope.refresh();
            }
          });
      }
    }

    $scope.delete = function (todo) {
      TodoSvc.delete(todo)
        .then(function () {
          $scope.refresh();
        });
    }

    $scope.update = function (todo) {
      angular.copy(todo, $scope.newTodo);
    }

    $scope.refresh();
  });

angular.module('app')
  .service('TodoSvc', function ($http) {
    this.fetch = function () {
      return $http.get('/api/users');
    };

    this.add = function (todo) {
      // return $http.post('/api/users', todo);
      return $http.post('/auth/local-signup', todo);
    };

    this.delete = function (todo) {
      return $http.post('/api/remove', todo);
    };

    this.update = function (todo) {
      return $http.post('/api/update', todo);
    };
  });