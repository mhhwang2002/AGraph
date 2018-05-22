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
console.log("* outV(1)="+JSON.stringify(g.outV("1")));
console.log("* outE(1)="+JSON.stringify(g.outE("1")));
console.log("* ToutE(1)="+JSON.stringify(g.ToutE("1")));
console.log("* inV(3)="+JSON.stringify(g.inV("3")));
console.log("* inE(3)="+JSON.stringify(g.inE("3")));
console.log("* TinE(3)="+JSON.stringify(g.TinE("3")));
console.log("* inV(4)="+JSON.stringify(g.inV("4")));
console.log("* inE(4)="+JSON.stringify(g.inE("4")));
console.log("* TinE(4)="+JSON.stringify(g.TinE("4")));