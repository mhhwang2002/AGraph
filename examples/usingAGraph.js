var AG = require("../AGraph.js");

let g = new AG.AGraph("_id", "_src", "_dst"); 
console.log("\t--Building the following Graph Struccture--");
console.log("                     +--+");
console.log("                     |  |");
console.log("                     V  |");
console.log("Graph Struccture: 1->2->3");
console.log("                     |   ");
console.log("                     +->4");
g.addVtx("1",{name:"one"});
g.addVtx("2",{name:"two"});
g.addVtx("3",{name:"three"});
g.addVtx("4",{name:"four"});

let e12=g.addEdge("1-2","1","2",{type:"da", precond: function(g, efstr){ eval(efstr); return this.pc;} } ); 

let e12_fstr = "let keys = Object.keys(g.VE);  this.pc = keys.indexOf('1-2')>0;"
console.log(e12.precond(g, e12_fstr)); // call edge function
console.log(e12.pc); // print the result.
console.log(e12); // print how e12 looksS like

g.addEdge("2-3","2","3",{type:"da"});   
g.addEdge("2-4","2","4",{type:"da"});   
g.addEdge("3-2","3","2",{type:"da"});   

console.log("\n\n\t--Print out the Graph --");
console.log(JSON.stringify(g));

console.log("\n\n\t--check some Graph's APIs --");
console.log("* getOutgoingVtxs(1)="+JSON.stringify(g.getOutgoingEdgeDestinations("1")));
console.log("* getOutgoingEdges(1)="+JSON.stringify(g.getOutgoingEdges("1"))); 
console.log("* getIncomingVtxs(3)="+JSON.stringify(g.getIncomingEdgeSources("3")));
console.log("* getIncomingEdges(3)="+JSON.stringify(g.getIncomingEdges("3"))); 
console.log("* getIncomingVtxs(4)="+JSON.stringify(g.getIncomingEdgeSources("4")));
console.log("* getIncomingEdges(4)="+JSON.stringify(g.getIncomingEdges("4"))); 