 const assert = require('chai').assert;
 const AG = require('../AGraph');

describe('Test4: Graph Write and Read', function(){
 	console.log("Test4 Struccture: 1->2->3");
    console.log("                     |   ");
    console.log("                     +->4");
 	{
 		let gsrc = new AG.AGraph(id_key="_id_", src_key="_src_", dst_key="_dst_");
        
	    gsrc.addVtx("1",{name:"one"});
	    gsrc.addVtx("2",{name:"two"});
	    gsrc.addVtx("3",{name:"three"});
	    gsrc.addVtx("4",{name:"four"});
	     
	    gsrc.addEdge("1-2","1","2",{type:"da"});   
	    gsrc.addEdge("2-3","2","3",{type:"db"});   
	    gsrc.addEdge("2-4","2","4",{type:"da"});

	    AG.writeGraphToFile(gsrc, "graph.json");
	}
 	var g = new AG.AGraph();
 	AG.readGraphFromFile("graph.json", g);
 	let str = JSON.stringify(g);
 	console.log("############### readGraphFromFile g= #############\n" + str);

 	it('ID "1" is a vertex.', function() {
 		assert.equal(g.isVtx("1"), true);
 	})
	it('ID "1" is NOT an edge.', function() {
		assert.equal(g.isEdge("1"), false);
	})
    it('vetex whose ID "1" has ID "1".', function() { 
		assert.equal(g.ID("1"), "1");
	})
    it('vetex whose ID "1" has ID "1".', function() { 
		assert.equal(g.isVtx("1"), true);
	})

	it('The entity of ID "1" has name "one".', function() {
		//console.log(g.getEntity("1"));
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
		//console.log("g.getVtxIDs().length",g.getVtxIDs().length);
		assert.equal(g.getVtxs().length,4);
	})
	it('{vertex id: whose name contains "t"}={"2","3"}', function() {
		let V = g.IDs(g.getVtxs(function(entity) { return entity.name.indexOf("t")>=0; } ));
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
		let E = g.IDs(g.getEdges(function(entity){return entity.type == "da"} ));
		console.log(E); 
		assert( E.indexOf("1-2")>=0 );
		assert( E.indexOf("2-4")>=0 );
		assert( E.indexOf("2-3")< 0 ); 
	})
	it('Destination ID of edge "1-2" is "2".', function() {
		assert(g.ID(g.getEdgeDestination("1-2"))=="2");
	})
	it('Source ID of edge "1-2" is "1".', function() {
		assert(g.ID(g.getEdgeSource("1-2"))=="1");
	})
	it('getOutgoingEdgeDestinations("1") contains "2".', function() {
		let outV = g.IDs(g.getOutgoingEdgeDestinations("1"));
		//console.log(outV);
		assert.equal(outV.indexOf("2"), 0);
	})
    it('getIncomingEdgeSources("2") contains "1".', function() {
		let inV = g.IDs(g.getIncomingEdgeSources("2"));
		//console.log(outV);
		assert.equal(inV.indexOf("1"), 0);
	})
	it('getOutgoingEdgeDestinations("2") contains "3" and "4".', function() {
		let outV = g.IDs(g.getOutgoingEdgeDestinations("2"));
		//console.log(outV);
		assert(outV.indexOf("3")>=0);
		assert(outV.indexOf("4")>=0);
	})
	it('ID(getEdgeDestination(getIncomingEdges(id)[0])) is id.', function() {
		let vid="2"
		let inE = g.getIncomingEdges(vid);
		//console.log(outV);
		assert(g.ID(g.getEdgeDestination(inE[0])) == vid); 
	})
	it('ID(getEdgeSource(getOutgoingEdges(id)[0])) is id.', function() {
		let vid="2"
		let outE = g.getOutgoingEdges(vid);
		//console.log(outV);
		assert(g.ID(g.getEdgeSource(outE[0])) == vid); 
	}) 
	
	it('removeEntity("1-2") removes edge "1-2"', function() {
		g.removeEntity("1-2");
		let E = g.IDs(g.getEdges());
		console.log(E); 
		assert( E.indexOf("1-2")<0 );
		assert( E.indexOf("2-4")>=0 );
		assert( E.indexOf("2-3")>=0 );

		g.addEdge("1-2","1","2",{type:"da"});   // backing to the original
	})
	
	it('removeEntity("2", true) removes the vetex "2" as well as all edges connecting to "2" ', function() {
		g.removeEntity("2", true);
		let V = g.IDs(g.getVtxs());
		console.log(V); 
		let E = g.IDs(g.getEdges());
		console.log(E); 
		assert( E.length == 0 ); 
        assert( V.indexOf("1")>= 0 ); 
        assert( V.indexOf("2") < 0 ); 	
        assert( V.indexOf("3")>= 0 ); 
        assert( V.indexOf("4")>= 0 ); 
    })
});