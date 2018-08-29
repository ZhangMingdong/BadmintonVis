var mainApp = angular.module("myApp", ['ngRoute']);

mainApp.controller('BadmintonCtrl', function ($scope, $http,$window) {
    angular.element($window).on('resize', function () { $scope.$apply() })

    $scope.badmintonData={
        array:[]
        ,game00:[]
        ,game01:[]
        ,game10:[]
        ,game11:[]
        ,game101:[]
        ,game011:[]


    }
    $scope.badmintonData.operations={
        display_mode:3
    }
    d3.csv('../data/processeddata.csv', function ( raw ) {
        // build the score matrix
        /*
            0: 0-0
            1: 1-0
            2: 0-1
            3: 1-1
            4: 1-0 - 1-1
            5: 0-1 - 1-1
            6：1-0, win current game
            7：0-1, win current game
        */
        // empty matrix
        var arrMaxValue = [0, 0, 0, 0, 0, 0, 0, 0];
        var arrMatrix = [[], [], [], [], [], [], [], []];
        for (var l = 0; l < 8; l++) {
            for (var i = 0; i < 31; i++) {
                var scores = []
                for (var j = 0; j < 31; j++) {
                    scores.push(0);
                }
                arrMatrix[l].push(scores);
            }
        }

        // fill the matrix
        var buf = [];// use to store the games of a single match
        raw.forEach(function (d) {
            if (buf.length == 0 || (buf[0].Seq == d.Seq)) {
                // record one match
                buf.push(d);
            }
            else {
                // handle the match
                if (buf.length == 2) {
                    // if there's two games, just parse them
                    for (var l = 0; l < 2; l++) {
                        var scores = buf[l].Scores.split(';');
                        var reverse = buf[l].Reverse;
                        scores.forEach(function (score) {
                            var bothSide = score.split('-');
                            var currentValue;
                            if (reverse == "1") {
                                currentValue = ++arrMatrix[l][bothSide[1]][bothSide[0]];
                            }
                            else {
                                currentValue = ++arrMatrix[l][bothSide[0]][bothSide[1]];
                            }

                            if (currentValue > arrMaxValue[l]) arrMaxValue[l] = currentValue;

                            // for matrix 6
                            if(l==1){
                                var currentValue;
                                if (reverse == "1") {
                                    currentValue = ++arrMatrix[6][bothSide[1]][bothSide[0]];
                                }
                                else {
                                    currentValue = ++arrMatrix[6][bothSide[0]][bothSide[1]];
                                }

                                if (currentValue > arrMaxValue[6]) arrMaxValue[l] = currentValue;
                            }


                        })
                    }

                }
                else if (buf.length == 3) {
                    // for three games
                    // 4: win 1 and 3; 5: win 2 and 3
                    var finalGameType = buf[0].Pattern;
                    for (var l = 0; l < 3; l++) {
                        var scores = buf[l].Scores.split(';');
                        scores.forEach(function (score) {
                            var bothSide = score.split('-');
                            var currentValue;
                            var currentGame = 0;
                            var reverse = 0;
                            if (l == 0 && finalGameType == 5) reverse = 1;
                            if (l == 1 && finalGameType == 4) reverse = 1;
                            if (l == 2) {
                                currentGame = 3;
                                // handle matrix 4 and 5
                                currentValue = ++arrMatrix[finalGameType][bothSide[0]][bothSide[1]];
                                if (currentValue > arrMaxValue[finalGameType]) arrMaxValue[finalGameType] = currentValue;

                            }
                            else if (l == 1 && finalGameType == 4) currentGame = 2;

                            if (reverse == 1)
                                currentValue = ++arrMatrix[currentGame][bothSide[1]][bothSide[0]];
                            else
                                currentValue = ++arrMatrix[currentGame][bothSide[0]][bothSide[1]];
                            if (currentValue > arrMaxValue[currentGame]) arrMaxValue[currentGame] = currentValue;
                            // for matrix 6 and 7
                            if (l==1){

                            }

                        })
                    }

                }
                // just ignore the matches with 1 or more than three games

                buf = [d];
            }
        })

        // build data array from the matrices
        var arrData = [[], [], [], [], [], []];
        for (var l = 0; l < 6; l++) {
            for (var i = 0; i < 31; i++) {
                for (var j = 0; j < 31; j++) {
                    var count_match;
                    var count_game;
                    if (l == 0 || l == 3){
                        count_match = arrMatrix[l][i][j] + arrMatrix[l][j][i];
                        count_game = arrMatrix[l][i][j] + arrMatrix[l][j][i];
                    }
                    else if (l == 4 || l == 5) {
                        count_match = arrMatrix[l][i][j] + arrMatrix[9 - l][j][i];
                        count_game = arrMatrix[l][i][j] + arrMatrix[l][j][i];
                    }
                    else {
                        count_match = arrMatrix[l][i][j] + arrMatrix[3 - l][j][i];
                        count_game = 1;
                    }
                    if((i<22&&j<22)||Math.abs(i-j)<2)
                        arrData[l].push(
                            {
                                player1: i,
                                player2: j,
                                count_game: count_game,
                                count_match: count_match,
                                win_rate_game: count_game == 0 ? 0 : arrMatrix[l][i][j] / count_game,
                                win_rate_match: count_match == 0 ? 0 : arrMatrix[l][i][j] / count_match,
                                value: arrMatrix[l][i][j] == 0 ? 0 : arrMaxValue[l]
                                //value: arrMatrix[l][i][j]/arrMaxValue[l]
                            }
                        )
                }
            }
        }
        //console.log("finished reading badminton data")
        $scope.badmintonData.game00=arrData[0];
        $scope.badmintonData.game01=arrData[1];
        $scope.badmintonData.game10=arrData[2];
        $scope.badmintonData.game11=arrData[3];
        $scope.badmintonData.game101=arrData[4];
        $scope.badmintonData.game011=arrData[5];
        $scope.badmintonData.array=arrData;
        //console.log(arrData)

        $scope.$apply();
    });

});

