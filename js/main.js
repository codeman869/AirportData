var width = 1500,
    height = 900,
    padding = 10,
    dX = 20,
    dY = 20,
    hiddenFlights = 200;
 

svg = d3.select("body").append("svg").attr("width",width+padding).attr("height",height+padding);

svg.append("rect").attr("height",height).attr("width",width).attr("style","fill:#d3d3d3;")
    .attr("rx",20).attr("ry",20);

svg.append("text").attr("x",(width+padding)/2).attr("y",30)
    .text("US Flights for the Month of Dec 2014").attr("class","title-text");
var force = d3.layout.force().linkDistance(400).size([width,height]);
//scrolling 
//svg.append("input").attr("type","range").attr("min",1).attr("max",300).attr("id","hiddenFlights");
                         
d3.json("js/final.json",function(error,graph){
    
   if (error) throw error;
    k = Math.sqrt(graph.airports.length / (width * height))
    force.gravity(100 * k).charge(-10/k);
    force.nodes(graph.airports).links(graph.flights).start();
    
    a = [];
    
    for(i=0;i<graph.flights.length;i++) {
        a[i] = graph.flights[i].value; 
    }
    
    //hiding all below average flights to uncrowd the graph
    var mean = d3.mean(a);
    var deviation = d3.deviation(a);
    hiddenFlights = mean;
    d3.select("#hiddenFlights").attr("min",d3.min(a)).attr("max",d3.max(a)).on("input",function(){
     
        update(this.value);
        
    }).attr("value",mean);
    
    d3.select("#flight-path-number").text(Math.round(mean) + " Flights")
    
    var link = svg.selectAll(".flight").data(graph.flights).enter().append("line")
        .attr("class","flight").style("marker-end","url(#suit)").classed("hidden",function(d){
            return d.value<hiddenFlights ? true:false;
        }).on("mouseover",function(d){
            d3.select("#flights").text("Flights: " + d.value);
            d3.select("#name").text("From: " + d.source.name + ", " + d.source.city)
            d3.select("#city").text("To: "+ d.target.name + ", " + d.target.city);
       
            var xpos = parseFloat(d3.mouse(this)[0]),
                ypos = parseFloat(d3.mouse(this)[1]);
            
            d3.select("#tooltip").style("top", ypos + dY + "px")
                .style("left", xpos + dX + "px").classed("hidden", false);
        });
    
    var node = svg.selectAll(".airport").data(graph.airports).enter().append("g")
        .attr("class","airport").call(force.drag);
    
        node.append("circle").attr("r",5).on("mouseover",function(d){
            
            d3.select("#city").text("City: " + d.city);
            d3.select("#name").text("Airport: " + d.name);
            d3.select("#flights").text("");
            
            var xpos = parseFloat(d3.mouse(this)[0]),
                ypos = parseFloat(d3.mouse(this)[1]);
            
            d3.select("#tooltip").style("top", ypos + dY + "px")
                .style("left", xpos + dX + "px").classed("hidden", false);
            
        }).on("mouseout",function(d) {
          
            d3.select("#tooltip").classed("hidden",true);
            
        });
        
        node.append("text").attr("dx",10).attr("dy", "0.35em").text(function(d){
           return d.name 
            
        });
    
    function update(flightValue) {
        hiddenFlights = flightValue;
        d3.selectAll(".flight").classed("hidden",function(d){
           
            return d.value<hiddenFlights? true:false;
            
        });
        
        d3.select("#flight-path-number").text(flightValue + " Flights")
        
    }
    
    
    force.on("tick",function(){
       
        link.attr("x1",function(d) { return d.source.x;})
        .attr("y1",function(d) { return d.source.y;})
        .attr("x2",function(d) { return d.target.x;})
        .attr("y2",function(d) { return d.target.y;});
        
        d3.selectAll(".airport circle").attr("cx",function(d){
           return d.x; 
        }).attr("cy",function(d){
            return d.y;
        });
        
        d3.selectAll(".airport text").attr("x",function(d){
            return d.x;
        }).attr("y",function(d){
            return d.y;
        });
        
    });
    
    svg.append("defs").selectAll("marker").data(["suit", "licensing", "resolved"])
            .enter().append("marker")
            .attr("id", function(d) { return d; })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
            .style("stroke", "#4daf4a")
            .style("opacity", "0.6");
});