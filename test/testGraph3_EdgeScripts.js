const assert = require('chai').assert;
const AG = require('../AGraph');

describe('Tes3', function(){
	console.log("Test3 Struccture: 1---precond-->2"); 
	let g = new AG.AGraph(id_key="_id_", src_key="_src_", dst_key="_dst_"); 
    g.addVtx("1",{name:"one"});
    g.addVtx("2",{name:"two"}); 

	let e12=g.addEdge("1-2","1","2",{type:"da", precond: function(g, efstr){ eval(efstr); return this.pc;} } ); 

	let e12_fstr = "let keys = Object.keys(g.VE);  this.pc = keys.indexOf('1-2')>0;" // set edge.pc value
	console.log("e12_fstr=",e12_fstr);

	it('e12.precond(g, e12_fstr)', function() {
		assert(e12.precond(g, e12_fstr));
		console.log(e12); // print how e12 looksS like
	})
	it('edge.pc', function() {
		assert(e12.pc);
	})  
 
});