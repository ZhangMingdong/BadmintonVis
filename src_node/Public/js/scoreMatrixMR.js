/*
    dsp: directive to show score matrix
    author: Mingdong
    logs:
        created
        2018/08/28
 */
mainApp.directive('scoreMatrix', function () {
    function link(scope, el, attr) {
        function scoreMatrix(){
            // 0.definition
            var threshold=50;
            var round=30;


            // 0.1.size
            var margin_value=20;
            var margin = {top: margin_value, right: margin_value, bottom: margin_value, left: margin_value}

            var svgBGW=0;
            var svgBGH=0;
            var svgW = svgBGW - margin.left - margin.right;
            var svgH = svgBGH - margin.top - margin.bottom;



            // 1.Add DOM elements
            var svgBG = d3.select(el[0]).append("svg").attr("width",svgBGW).attr("height",svgBGH);
            var svg=[];
            var svgAxisX=[];
            var svgAxisY=[];
            for(var i=0;i<6;i++){
                svg[i]=svgBG.append("g");
                svgAxisX[i] = svg[i].append("g").attr("class", "x axis")
                svgAxisY[i] = svg[i].append("g").attr("class", "y axis")
            }


            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgBGW = el[0].clientWidth;
                svgBGH = el[0].clientHeight;

                if(svgBGW<600) svgBGW=600;
                if(svgBGH<400) svgBGH=400;

                return svgBGW + svgBGH;
            }, resize);



            // response the size-change
            function resize(){
                //console.log("resize")
                svgW = svgBGW - margin.left - margin.right;
                svgH = svgBGH - margin.top - margin.bottom;
                svgBG
                    .attr("width", svgBGW)
                    .attr("height", svgBGH)
                for(var i=0;i<6;i++){
                    svg[i]
                        .attr("width", svgW)
                        .attr("height", svgH)

                }
                redraw();
            }

            function redraw(){
                //console.log("redraw")
                if(scope.data.length==0) return;

                var gameSize=svgH/2.1,
                    itemSize = gameSize/round,
                    cellSize = itemSize - 1;

                var rotated_radius=(svgBGH)*0.35355;

                //svg.attr("transform", "rotate(45)");
                //svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                //svgBG.attr("transform", "rotate(10)");

                //svg.attr("transform", "translate(" + margin.left + "," + margin.top + ") rotate(45)");
                //svg.attr("transform", "rotate(45) translate(" + 200 + "," + 0 + ")");
                //svg.attr("transform", "rotate(-45)");
                function redrawMatrix(i){
                    var rotated_margin=i>2? gameSize*1.1:0;
                    var rotated_margin_x=margin_value*1.414+rotated_margin;
                    var rotated_margin_y=margin_value*1.414+rotated_margin;
                    if(i==1||i==4) {
                        rotated_margin_y+=gameSize*.8;
                    }
                    else if(i==2||i==5) {
                        rotated_margin_x+=gameSize*.8;
                    }


                    svg[i].attr("transform", "rotate(45) translate(" + (rotated_margin_x+rotated_radius)
                        + "," + (-rotated_margin_y+rotated_radius-gameSize) + ")");

                    var data=scope.data[i];
                    //console.log(scope.operations)

                    var x_elements = d3.set(data.map(function( item ) { return item.player2; } )).values(),
                        y_elements = d3.set(data.map(function( item ) { return item.player1; } )).values();

                    var x_elements_short = d3.set(data.map(function( item ) { return item.player2<22?item.player2:0; } )).values(),
                        y_elements_short = d3.set(data.map(function( item ) { return item.player1<22?item.player1:0; } )).values();

                    var xScale = d3.scaleBand()
                        .domain(x_elements)
                        .range([0, gameSize]);
                    var yScale = d3.scaleBand()
                        .domain(y_elements)
                        .range([gameSize,0]);

                    var xScale_short = d3.scaleBand()
                        .domain(x_elements_short)
                        .range([0, gameSize*22/31]);
                    var yScale_short = d3.scaleBand()
                        .domain(y_elements_short)
                        .range([gameSize*22/31,0]);


                    var xAxis = d3.axisBottom()
                        .scale(xScale_short)
                        .tickFormat(function (d) {
                            return d;
                        })

                    var yAxis = d3.axisLeft()
                        .scale(yScale_short)
                        .tickFormat(function (d) {
                            return d;
                        })

                    svgAxisX[i]
                        .attr("transform", "translate(" + 0 + "," + gameSize*10/31 + ")")
                        .call(yAxis)
                        .selectAll('text')
                        .attr('font-weight', 'normal');

                    svgAxisY[i]
                        .attr("transform", "translate(" + 0 + "," + gameSize + ")")
                        .call(xAxis)
                        .selectAll('text')
                        .attr('font-weight', 'normal')


                    var pos={
                        x: margin.left,
                        y: margin.top
                    }



                    var cells = svg[i].selectAll('.cell')
                        .data(data);

                    function setCells(cells){
                        cells
                            .attr('width', cellSize)
                            .attr('height', cellSize)
                            .attr('y', function(d) { return yScale(d.player1); })
                            .attr('x', function(d) { return xScale(d.player2); })
                            .on("mouseover", function(d) {
                                console.log(d.player1+":"+d.player2
                                    +"; game count: "+d.count_game
                                    +"; match count: "+d.count_match
                                    +"; game win rate: "+d.win_rate_game
                                    +"; match win rate: "+d.win_rate_match
                                )
                            })

                        console.log(scope.operations.display_mode)
                        if(scope.operations.display_mode==1){
                            cells
                                .attr('fill', function(d) {
                                        if(d.count_match==0) return 'black'
                                        else if(d.count_match<threshold) return 'gray'
                                        else if(d.win_rate_match>0.5) return 'blue'
                                        else return 'red'
                                    }
                                )
                                .attr('opacity',function(d){
                                    if(d.count_match<threshold) return 1;
                                    return Math.abs(d.win_rate_match-0.5);
                                })
                        }
                        else if(scope.operations.display_mode==2) {
                            cells
                                .attr('fill', function(d) {
                                        if(d.count_game==0) return 'black'
                                        else if(d.count_game<threshold) return 'gray'
                                        else if(d.win_rate_game>0.5) return 'blue'
                                        else return 'red'
                                    }
                                )
                                .attr('opacity',function(d){
                                    if(d.count_game<threshold) return 1;
                                    return Math.abs(d.win_rate_game-0.5);
                                })
                        }
                        else if(scope.operations.display_mode==3){
                            cells
                                .attr('fill', function(d) { return 'red'; })
                                .attr('opacity',function(d){return d.value;})
                        }
                        else{

                            console.log(scope.operations.display_mode)
                            console.log("display mode error")
                        }
                    }
                    setCells(cells.enter().append('rect').attr('class', 'cell'))
                    setCells(cells);

                    cells.exit().remove();
                }
                redrawMatrix(0)
                redrawMatrix(1)
                redrawMatrix(2)
                redrawMatrix(3)
                redrawMatrix(4)
                redrawMatrix(5)


            }

            redraw();

            scope.$watch('data', redraw);
            scope.$watch('operations.display_mode', redraw);
            scope.$watch('operations.threshold', redraw);
        }
        scoreMatrix();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=',operations: '=' }
    };
});