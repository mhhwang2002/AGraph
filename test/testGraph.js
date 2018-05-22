const assert = require('chai').assert;
const AG = require('../AGraph');

describe('Test', function(){
	console.log("Graph Struccture: 1->2->3");
    console.log("                     |   ");
    console.log("                     +->4");
	var g = new AG.AGraph(id_key="__id_", src_key="_src_", dst_key="_dst_");
        
    g.addVtx("1",{name:"one"});
    g.addVtx("2",{name:"two"});
    g.addVtx("3",{name:"three"});
    g.addVtx("4",{name:"four"});
     
    g.addEdge("1-2","1","2",{type:"da"});   
    g.addEdge("2-3","2","3",{type:"db"});   
    g.addEdge("2-4","2","4",{type:"da"});

	it('ID "1" is a vertex.', function() {
		assert.equal(g.isVtx("1"), true);
	})
	it('ID "1" is NOT an edge.', function() {
		assert.equal(g.isEdge("1"), false);
	})
	it('The entity of ID "1" has name "one".', function() {
		assert.equal(g.getEntity("1").name, "one");
	})
	it('The attribute "name" of entity of ID "1" has name "one".', function() {
		assert.equal(g.getEntityAttribute("1", "name"), "one");
	})
	it('Set attribut "name" of eneity "1" as "ONE".', function() {
		g.setEntityAttribute("1", "name", "ONE")
		assert.equal(g.getEntityAttribute("1", "name"), "ONE");
	})
	it('No of vertices are 4.', function() {
		//console.log("g.getVtxs().length",g.getVtxs().length);
		assert.equal(g.getVtxs().length,4);
	})
	it('{vertex id: whose name contains "t"}={"2","3"}', function() {
		let V = g.getVtxs(function(entity) { return entity.name.indexOf("t")>=0; } );
		console.log(V); 
		assert( V.indexOf("2")>=0 );
		assert( V.indexOf("3")>=0 );
		assert( V.indexOf("1")< 0 );
		assert( V.indexOf("4")< 0 ); 
	})
	it('ID "1-2" is an edge.', function() {
		//console.log("g.getEdges().length",g.getEdges().length);
		assert(g.isEdge("1-2"));
	})

	it('No of edges are 4.', function() {
		//console.log("g.getEdges().length",g.getEdges().length);
		assert.equal(g.getEdges().length,3);
	})
	it('{edge id: whose entity has type = "da"} = {"1-2", "2-4"}.', function() {
		//console.log("g.getEdges().length",g.getEdges().length);
		let E = g.getEdges(function(entity){return entity.type == "da"} )
		console.log(E); 
		assert( E.indexOf("1-2")>=0 );
		assert( E.indexOf("2-4")>=0 );
		assert( E.indexOf("2-3")< 0 ); 
	})
	it('Destination of edge "1-2" is "2".', function() {
		assert(g.getEdgeDestination("1-2")=="2");
	})
	it('Source of edge "1-2" is "1".', function() {
		assert(g.getEdgeSource("1-2")=="1");
	})
	it('outV("1") contains "2".', function() {
		let outV = g.outV("1");
		//console.log(outV);
		assert.equal(outV.indexOf("2"), 0);
	})

	it('outV("2") contains "3" and "4".', function() {
		let outV = g.outV("2");
		//console.log(outV);
		assert(outV.indexOf("3")>=0);
		assert(outV.indexOf("4")>=0);
	})
	it('getEdgeDesination(inE(id)[0]) is id.', function() {
		let vid="2"
		let inE = g.inE(vid);
		//console.log(outV);
		assert(g.getEdgeDestination(inE[0]) == vid); 
	})
	it('getEdgeSource(outE(id)[0]) is id.', function() {
		let vid="2"
		let outE = g.outE(vid);
		//console.log(outV);
		assert(g.getEdgeSource(outE[0]) == vid); 
	})
	it('ToutV("1") contains "2", "3", "4".', function() {
		let outV = g.ToutV("1");
		console.log(outV);
		assert( outV.indexOf("2")>=0 );
		assert( outV.indexOf("3")>=0 );
		assert( outV.indexOf("4")>=0 );
	})
	it('TinV("4") contains "1", "2", but not "3".', function() {
		let inV = g.TinV("4");
		console.log(inV); 
		assert( inV.indexOf("1")>=0 );
		assert( inV.indexOf("2")>=0 );
		assert( inV.indexOf("3")< 0 );
	})
	it('ToutE("1") contains "1-2", "2-3", "3-4".', function() {
		let outE = g.ToutE("1");
		console.log(outE); 
		assert( outE.indexOf("1-2")>=0 );
		assert( outE.indexOf("2-3")>=0 );
		assert( outE.indexOf("2-4")>=0 );
	})
	it('TinE("4") contains "1-2", "3-4", but not "2-3".', function() {
		let inE = g.TinE("4");
		console.log(inE); 
		assert( inE.indexOf("1-2")>=0 );
		assert( inE.indexOf("2-4")>=0 );
		assert( inE.indexOf("2-3")< 0 );
	})
	
	it('removeEntity("1-2") removes edge "1-2"', function() {
		g.removeEntity("1-2");
		let E = g.getEdges();
		console.log(E); 
		assert( E.indexOf("1-2")<0 );
		assert( E.indexOf("2-4")>=0 );
		assert( E.indexOf("2-3")>=0 );

		g.addEdge("1-2","1","2",{type:"da"});   // backing to the original
	})
	
	it('removeEntity("2", true) removes the vetex "2" as well as all edges connecting to "2" ', function() {
		g.removeEntity("2", true);
		let V = g.getVtxs();
		console.log(V); 
		let E = g.getEdges();
		console.log(E); 
		assert( E.length == 0 ); 
        assert( V.indexOf("1")>= 0 ); 
        assert( V.indexOf("2") < 0 ); 	
        assert( V.indexOf("3")>= 0 ); 
        assert( V.indexOf("4")>= 0 ); 
    })
});