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
            var round=31;


            // 0.1.size
            var margin = {top: 30, right: 30, bottom: 30, left: 30},
                padding=40;
            var svgBGW=1800;
            var svgBGH=1000;
            var svgW = svgBGW - margin.left - margin.right;
            var svgH = svgBGH - margin.top - margin.bottom;



            // 1.Add DOM elements
            var svgBG = d3.select(el[0]).append("svg").attr("width",svgBGW).attr("height",svgBGH);
            //svgBG.attr("transform", "rotate(45)");
            var svg=svgBG.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var svgAxisX= svg.append("g").attr("class", "x axis")
            var svgAxisY= svg.append("g").attr("class", "y axis")

            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgBGW = el[0].clientWidth;
                svgBGH = el[0].clientHeight;

                //if(svgBGW<600) svgBGW=600;
                //if(svgBGH<400) svgBGH=400;

                return svgBGW + svgBGH;
            }, resize);



            // response the size-change
            function resize(){
                //console.log("resize")
                svgW = svgBGW - margin.left - margin.right;
                svgH = svgBGH - margin.top - margin.bottom;
                if(svgW<svgH) svgH=svgW;
                else svgW=svgH;
                svgBG
                    .attr("width", svgBGW)
                    .attr("height", svgBGH)
                svg
                    .attr("width", svgW)
                    .attr("height", svgH)
                redraw();
            }

            function redraw(){
                //console.log("redraw")
                if(scope.data==0) return;
                var data=scope.data;
                //console.log(scope.operations)

                var gameSize=svgW,
                    itemSize = svgW/round,
                    cellSize = itemSize - 1;

                var x_elements = d3.set(data.map(function( item ) { return item.player2; } )).values(),
                    y_elements = d3.set(data.map(function( item ) { return item.player1; } )).values();

                var xScale = d3.scaleBand()
                    .domain(x_elements)
                    .range([0, gameSize]);

                var xAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat(function (d) {
                        return d;
                    })

                var yScale = d3.scaleBand()
                    .domain(y_elements)
                    .range([gameSize,0]);

                var yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickFormat(function (d) {
                        return d;
                    })

                svgAxisX
                    .call(yAxis)
                    .selectAll('text')
                    .attr('font-weight', 'normal');

                svgAxisY
                    .attr("transform", "translate(" + 0 + "," + gameSize + ")")
                    .call(xAxis)
                    .selectAll('text')
                    .attr('font-weight', 'normal')


                var pos={
                    x: margin.left,
                    y: margin.top
                }



                var cells = svg.selectAll('.cell')
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

            redraw();

            scope.$watch('data', redraw);
            scope.$watch('operations.display_mode', redraw);
        }
        scoreMatrix();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=',operations: '=' }
    };
});