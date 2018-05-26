const assert = require('chai').assert;
const AG = require('../AGraph');

describe('Test2', function(){
	console.log("Test2 Struccture: 1--->2");
    console.log("                    |   ");
    console.log("                    +->3");
	var g = new AG.AGraph(id_key="__id_", src_key="_src_", dst_key="_dst_");
        
    g.addVtx("1",{name:"one"});
    g.addVtx("2",{name:"two"});
    g.addVtx("3",{name:"three"});
     
    g.addEdge(  "1-2","1",  "2",{type:"da"});
    g.addEdge("1-2-3","1-2","3",{type:"db"});

	it('ID "1-2-3" is an edge.', function() {
		//console.log("g.getEdges().length",g.getEdges().length);
		assert(g.isEdge("1-2"));
	})

	it('No of edges are 2.', function() {
		//console.log("g.getEdges().length",g.getEdges().length);
		assert(g.getEdges().length == 2);
	})
 
	it('Destination of edge "1-2-3" is "3".', function() {
		assert(g.getEdgeDestination("1-2-3")=="3");
	})
	it('Source of edge "1-2-3" is "1-2".', function() {
		assert(g.getEdgeSource("1-2-3")=="1-2");
	})
    it('Source of edge "1-2-3" is an edge.', function() {
		assert(g.isEdge(g.getEdgeSource("1-2-3")));
	}) 
});