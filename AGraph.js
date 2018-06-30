/**
  Author: Moon Ho Hwang
  email: {moon.hwang}@gmail.com
  
  Modification History 
     Jan/7/2017: create
     May/12/2018: begin to make it npm a module
     Jun/16/2018: version 2.0. explicitly specifying IDs and Entities
*/ 

var AG = AG || { VERSION:1 }
/**
 * Attributed Graph 
 * @constructor
 */
AG.AGraph = function(id_key, src_key, dst_key) {  
    //KeyWords = {S_id : id_key, S_src: src_key, S_dst: dst_key};// Every vertex and edge will have an attribute S_id. 
    this.S_id = id_key;// Every vertex and edge will have an attribute S_id. 
    this.S_src = src_key;// Every vertex and edge will have an attribute S_id.   
    this.S_dst = dst_key;// Every edge will have an attribute S_src indicating the source  
     
    this.VE={} ; // VE[id]={atn:atv}: vertices or edges along with attributes ;
                 // e=VE[id] is called an edge if S_src in e & S_dst in e;
    this.FE={}; // FE[src]={eid}: forward edges starting from src s.t. E[eid].S_src = src for eid in FE[src] ;
    this.BE={}; // BE[dst]={eid}: backward edges ending to dst s.t. E[eid].S_dst = dst for eid in BE[dst] ;  
    
     /**
     * get the id of an input.
     * @param input  - Either one of an ID or an entity.  
     * @return  input if input is an id registered, input[S_id] if input is an entity registered , null otherwise. 
    */
    this.ID = function(input) {
        let id = null;
        if(input in this.VE)
            id = input;
        else if (this.S_id in input &&input[this.S_id] in this.VE)
            id = input[this.S_id]; 
        
        return id;
    }

    /**
     * get an entity of this graph.
     * @param input  - Either one of an ID or an entity.  
     * @return  input if input in VE, or VE[input[S_id]] if input[S_id] is registered. 
     */
    this.getEntity= function(input) {
        let id = null;
        if(input in this.VE) // input is an id
            id = input; 
        else if (this.S_id in input && input[this.S_id] in this.VE) // input is an entity 
            id = input[this.S_id];
        
        if(id)
            return this.VE[id];
        else
            return null;
    }
    /**
     * check if an input is a vertex in VE.
     * @param input  - Either one of an ID or an entity.  
     * @return {boolean} true if the input is a vertex; false otherwise.
    */
    this.isVtx = function(input) { 
        let ent = this.getEntity(this.ID(input));
        if(ent) 
            return !((this.S_src in ent) && (this.S_dst in ent));
        else
            throw new Error(input + " is in this graph.");
    } 
    
 	/**
     * check if an input is an edge in VE.
     * @param input  - Either one of an ID or an entity.   
     * @return {boolean} true if the input is not an vertex; false otherwise.
    */
    this.isEdge = function(input) { 
       return ! this.isVtx(input); 
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// Section 1. Vertex & Edge commonly related Methods ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    
    /**
     * get a set of ids. 
     * @param {Array} inputArray - array of inputs.
     * @return an array of ids. 
     */
    this.IDs= function(inputArray) {
        let answer=[]
        for(let ii in inputArray)
            answer.push(this.ID(inputArray[ii]));
        return answer;
    }
	/**
     * convert inputArray to an array of entities.  
     * @param {Array} inputArray - am array of inputs.
     * @return an array of entities. 
     */
    this.toEntities= function(inputArray) {
    	let answer=[]
        for(let ii in inputArray)
        	answer.push(this.getEntity(inputArray[ii]));
        return answer;
    }
     /**
     * get all entities satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection. 
     * @return a set of entities in VE. 
     */
    this.getEntitiesByChecker = function(achecker) { 
        let entities = [];
        for (let id in this.VE) {
        	if(!achecker || achecker(this.getEntity(id))) {
        		entities.push(this.getEntitiy(id));
        	} 
        }
        return entities;
    }
    
    /**
     * get an entity attribute value.
     * @param input  - Either one of an ID or an entity searching for.    
     * @param {string} key - an attribute name looking for.
     * @return attribute if exists. null if not.
     */
    this.getEntityAttribute = function(input, key){
        let entity = this.getEntity(input);
        return (key in entity)? entity[key]: null;
    } 

    /**
     * set an entity attribute by value.
     * @param input  - Either one of an ID or an entity searching for.   
     * @param {string} key - an attribute name looking for.
     * @param {object} value - the attribute value which can be any thing. 
     */
    this.setEntityAttribute = function (input, key, value) {
         let entity = this.getEntity(input);
        if(key in entity) 
            entity[key]=value;
        else
            throw new Error(id + " doesn't exists."); 
    } 

    /**
     * remove an entity (along with connected edges optional) .
     * @param input  - Either one of an ID or an entity.
     * @param {boolean} remove_linked_edges - a boolean flag true for removing all connected edges from/to id.
     */
    this.removeEntity = function(input, remove_linked_edges) {
        let id = this.ID(input);
        if(id in this.VE) { 
            if(remove_linked_edges) {   
                let getIncomingEdgeIDs = this.IDs(this.getIncomingEdges(id));
                //console.log("deleting all getIncomingEdgeIDs(" + id +")\n"+ graphWriter.Eids2str(getIncomingEdgeIDs, this, null)); 
                let getOutgoingEdgeIDs = this.IDs(this.getOutgoingEdges(id));
                //console.log("deleting all getOutgoingEdgeIDs(" + id +")\n"+ graphWriter.Eids2str(getOutgoingEdgeIDs, this, null));
                for(let ii in getIncomingEdgeIDs)
                    delete this.VE[getIncomingEdgeIDs[ii]] 
                for(let ii in getOutgoingEdgeIDs)
                    delete this.VE[getOutgoingEdgeIDs[ii]] 

                delete this.FE[id];
                delete this.BE[id];
            }
            delete this.VE[id];
        }
        else {
            console.log("entity="+id + " is not an entity of a graph. Warning!");
        }
    }   

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// Section 2. Vertex-related Methods ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    /**
     * add a vertex.
     * @param id an unique identifier (key) of adding vertex.
     * @param {Object} attrs attributes of adding vertex. 
     * @return an object - the vertex attribute contain attributes: this.S_id:id.
     */
    this.addVtx = function(id, attrs) { 
        let entity={};
        for(let k in attrs) 
            entity[k]=attrs[k];
        if(!(this.S_id in entity)) // if S_id is not defined in attrs 
            entity[this.S_id]=id; // add S_id as id

        this.VE[id]= entity; 
        return entity;
    } 
     
    /**
     * get all vertices satisfied by an checker.
     * @param {function} achecker takes an entity.
     * @return a set of vertices.
     */
    this.getVtxs = function(achecker) {
        let result = [];
        for(id in this.VE) { 
            if(this.isVtx(id)) {
                if(!achecker || achecker(this.VE[id]))
                	result.push(id);  
            } 
        }
        return result;
    }

    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// End of Vertex-related Methods //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// Section 2. Edge-related Methods ////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * add an edge.
     * @param id - an unique identifier (key) for the edge. 
     * @param src_id - a source id that can be for a vertex or an edge. 
     * @param  dst_id - a destination id that can be for a vertex or an edge. 
     * @param {Object} attrs attributes of adding vertex. 
     * @throws Exception if src_id or dst_id doesn't exists in V or E. 
     * @return the edge attributes which contain attributes: S_id:id, S_dst:dst_id and S_src:src_id.
     */
    this.addEdge = function(id, src_id, dst_id, attrs) {
        if (id in this.VE)
            throw new Error("Edge "+id+" is already registered.");
        if ( !(src_id in this.VE ) )
            throw new Error("source "+src_id+" is not registered.");
        if ( !(dst_id in this.VE) )
            throw new Error("destination "+dst_id+" is not registered.");

        if ( !(src_id in this.FE) ) // src_id is not in FE yet
            this.FE[src_id]=[]; // put an array 
        if ( !(dst_id in this.BE) ) // dst_id is not in BE yet 
            this.BE[dst_id]=[]; // put an array  
        var edge = {};
        for(var k in attrs) 
            edge[k]=attrs[k];
        
        if(!edge[this.S_id]) edge[this.S_id]=id; 
        if(!edge[this.S_dst]) edge[this.S_dst]=dst_id; 
        if(!edge[this.S_src]) edge[this.S_src]=src_id;   
        
        this.VE[id]=edge;
        if (id in this.FE[src_id])
            console.log("Warning: Edge " + id+ " is already in FE["+src_id+"]!");
        else  {
            this.FE[src_id].push(id);
            if (id in this.BE[dst_id])
                console.log("Warning: " + id + " is already in BE["+dst_id+"]!");
            else { 
                this.BE[dst_id].push(id);
                //console.log(graphWriter.attr2str(edge) + " succeed!");
            }
        } 
        return edge;
    }

     /**
     * get all edges satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection. 
     * @return a set of edges. 
     */
    this.getEdges = function(achecker) {
        var result = [];
        for(id in this.VE) { 
            if(this.isEdge(id)) {
                let edge = this.VE[id];
                if(!achecker || achecker(edge))
                      result.push(edge);  
            } 
        }
        return result;
    } 
  
    
    /**
      * get the source entity of an edge. 
      * @param input  - Either one of an ID or an entity.   
      * @return source entity (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeSource = function(input) {
        let srcID = this.getEntityAttribute(input, this.S_src);
        return this.getEntity(srcID); 
    } 
   

     /**
      * get the destination entity of an edge.
      * @param input  - Either one of an ID or an entity.   
      * @return destination entity (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeDestination= function(input) {
        let dstID = this.getEntityAttribute(input, this.S_dst); 
        return this.getEntity(dstID); 
    } 

    /**
     * get a list of incoming edges.
     * @param to_entity a destination entity (or id) to which edges are coming in. 
     * @param echecker an edge checker. 
     * @return an array of incoming edges to to_entity in terms of echecker. 
     */ 
    this.getIncomingEdges = function(to_entity, echecker) { 
        let results = []
        let to_d = this.ID(to_entity);
        if (to_d in this.BE) {
            var edge_ids = this.BE[to_d];
            for (let ii=0; edge_ids && ii<edge_ids.length; ii++) {
                let edge_id = edge_ids[ii];
                let edge = this.VE[edge_id];
                if (!echecker || echecker(edge))
                    results.push(edge);
            }
        }
        return results;
    } 
 	 
    /**
     * get a list of outgoing edges.
     * @param from_entity a source entity (or id) from which edges are going from. 
     * @param echecker an edge checker. 
     * @return an array of outgoing edges from  from_entity in terms of echecker. 
     */ 
    this.getOutgoingEdges = function(from_entity, echecker) { 
        let results = [];
        let from_s = this.ID(from_entity);
        if (from_s in this.FE) {
            let edge_ids = this.FE[from_s];
            for (let ii=0; edge_ids && ii<edge_ids.length; ii++) {
                let edge_id = edge_ids[ii];
                let edge = this.VE[edge_id];
                if (!echecker || echecker(edge))
                    results.push(edge);
            }
        }
        return results;
    } 
	  

     /**
     * get all sources of inncoming edges to an entity, and satisfy the optional condition echecker
     * @param to_entity a destination entity (or id) to which edges are coming in. 
     * @param echecker an edge checker. 
     * @return the set of entities
     */
    this.getIncomingEdgeSources = function(to_entity, echecker) {
        let result = [];
        let BE = this.getIncomingEdges(to_entity, echecker); // 
        for (let ii in BE) {
            let beid = BE[ii];
            let src = this.getEdgeSource(beid);
            if (src)
                result.push(src);
        }
        return result;
    }
 	 
    /**
     * get all destination of outgoinging edges from an entity, and satisfy the optional condition echecker
     * @param from_entity a source entity (or id) from which edges are going from. 
     * @param echecker an edge checker. 
     * @return the set of entities
     */
    this.getOutgoingEdgeDestinations= function(from_entity, echecker) {
        let result = [];
        let FE = this.getOutgoingEdges(from_entity, echecker); // 
        for (let ii in FE) {
            let feid = FE[ii];
            let dst= this.getEdgeDestination(feid);
            if (dst)
                result.push(dst);
        }
        return result;
    }
  

    this.entityToString = function(entity) { 
        let answer = "";
        let i=0;
        for(aname in entity) {
            answer += aname + "=" + entity[aname];
            if(i>0)
                answer += ",";
            i++;
        }
        return answer;
    } 

    this.printGraphStructure = function(){
        console.log("|VE|="+Object.keys(this.VE).length);
        console.log("|FE|="+Object.keys(this.FE).length);
        console.log("|BE|="+Object.keys(this.BE).length);
    }
} // end of AG.Graph 

if(typeof module != 'undefined')
    module.exports.AGraph = AG.AGraph; //   

if (typeof window === 'undefined') {
    if (require.main === module) {// runing this file using node.js  
        console.log("running it by Node.js!");
        //console.log("                     +--+");
        //console.log("                     |  |");
        //console.log("                     V  |");
        console.log("Graph Struccture: 1->2->3");
        console.log("                     |   ");
        console.log("                     +->4");
        var g = new AG.AGraph(id_key="__id_", src_key="_src_", dst_key="_dst_");
        
        g.addVtx("1",{name:"one"});
        g.addVtx("2",{name:"two"});
        g.addVtx("3",{name:"three"});
        g.addVtx("4",{name:"four"});
         
        g.addEdge("1-2","1","2",{type:"a"});   
        g.addEdge("2-3","2","3",{type:"b"});   
        g.addEdge("2-4","2","4",{type:"a"});   
        //g.addEdge("3-2","3","3",{type:"da"});   

        console.log("* getOutgoingVtxs(1)="+JSON.stringify(g.getOutgoingEdgeDestinations("1")));
        console.log("* getOutgoingEdges(1)="+JSON.stringify(g.getOutgoingEdges("1"))); 
        console.log("* getIncomingVtxs(3)="+JSON.stringify(g.getIncomingEdgeSources("3")));
        console.log("* getIncomingEdges(3)="+JSON.stringify(g.getIncomingEdges("3"))); 
        console.log("* getIncomingVtxs(4)="+JSON.stringify(g.getIncomingEdgeSources("4")));
        console.log("* getIncomingEdges(4)="+JSON.stringify(g.getIncomingEdges("4"))); 
    }
} else {
    // in browser 
}