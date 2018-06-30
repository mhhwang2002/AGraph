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
     * check if an id is a vertex id 
     * @param id  - identifier
     * @return {boolean} true if the input id is for a vertex; false otherwise.
    */
    this.isVtxID = function(id) {
        var ent = this.getEntity(id);
        if(ent) 
            return !((this.S_src in ent) && (this.S_dst in ent));
        else
            throw new Error(id + " doesn't exists.");
    }
    /**
     * check if an entity is a vertex in VE
     * @param ent  - an entity  
     * @return {boolean} true if the input is a vertex; false otherwise.
    */
    this.isVtxEntity = function(ent) { 
        if(this.S_id in ent && ent[S_id] in this.VE) 
            return !((this.S_src in ent) && (this.S_dst in ent));
        else
            throw new Error(ent + " doesn't exists.");
    }
    
    /**
     * check if an input is is an edge.
     * @param id  - identifier
     * @return {boolean} true if the input id is not for a vertex; false otherwise.
    */
    this.isEdgeID = function(id) { 
        return ! this.isVtxID(id); 
    }

 	/**
     * check if an entity is an edge in VE
     * @param ent  - an entity  
     * @return {boolean} true if the input is not an vertex; false otherwise.
    */
    this.isEdgeEntity = function(ent) { 
       return ! this.isVtxEngity(ent.id); 
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// Section 1. Vertex & Edge commonly related Methods ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    /**
     * get an entity which can be either one of a vertex or an edge
     * @param {string} id - vertex or edge id searching for 
     * @return the entity s.t. VE[this.S_id] = id if exists, null if not. 
     */
    this.getEntity= function(id) {
        if(id in this.VE)
            return this.VE[id];
        else
            return null;
    }
	/**
     * get a set of entities  
     * @param {Array} idArray - array of vertex or edge ids searching for 
     * @return the entity s.t. VE[this.S_id] = id if exists, null if not. 
     */
    this.getEntities= function(idArray) {
    	let answer=[]
        for(let ii in idArray)
        	answer.push(this.getEntity(idArray[ii]));
        return answer;
    }
     /**
     * get all entities satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection 
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
     * @param {string} id - an entity id searching for    
     * @param {string} key - an attribute name looking for
     * @return attribute if exists. null if not.
     */
    this.getEntityAttribute = function(id, key){
        var entity = this.getEntity(id);
        return (key in entity)? entity[key]: null;
    } 

    /**
     * set an entity attribute by value.
     * @param {string} id - an entity id searching for    
     * @param {string} key - an attribute name looking for
     * @param {object} value - the attribute value which can be any thing. 
     */
    this.setEntityAttribute = function (id, key, value) {
        if(id in this.VE) 
            this.getEntity(id)[key]=value;
        else
            throw new Error(id + " doesn't exists."); 
    } 

    /**
     * remove an entity (along with connected edges optional) 
     * @param {sting} id - an id for a vertex or an edge.
     * @param {boolean} remove_linked_edges - a boolean flag true for removing all connected edges from/to id.
     */
    this.removeEntity = function(id, remove_linked_edges) {
        if(id in this.VE) { 
            if(remove_linked_edges) {   
                var getIncomingEdgeIDs = this.getIncomingEdgeIDs(id);
                //console.log("deleting all getIncomingEdgeIDs(" + id +")\n"+ graphWriter.Eids2str(getIncomingEdgeIDs, this, null)); 
                var getOutgoingEdgeIDs = this.getOutgoingEdgeIDs(id);
                //console.log("deleting all getOutgoingEdgeIDs(" + id +")\n"+ graphWriter.Eids2str(getOutgoingEdgeIDs, this, null));
                for(var ii in getIncomingEdgeIDs)
                    delete this.VE[getIncomingEdgeIDs[ii]] 
                for(var ii in getOutgoingEdgeIDs)
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
     * @param {string} id - the vertex id 
     * @return an object - the vertex attribute contain attributes: this.S_id:id.
     */
    this.addVtx = function(id, attrs) { 
        var entity={};
        for(var k in attrs) 
            entity[k]=attrs[k];
        if(!(this.S_id in entity)) // if S_id is not defined in attrs 
            entity[this.S_id]=id; // add S_id as id

        this.VE[id]= entity; 
        return entity;
    } 
     
    /**
     * get all vertice IDs satisfied by an checker.
     * @param {function} achecker takes an entity
     * @return a set of vertex ids. 
     */
    this.getVtxIDs = function(achecker) {
        var result = [];
        for(id in this.VE) { 
            if(this.isVtxID(id)) {
                if(!achecker || achecker(this.VE[id]))
                	result.push(id);  
            } 
        }
        return result;
    }

    /**
     * get all vertice satisfied by an checker.
     * @param {function} achecker takes an entity
     * @return a set of vertex ids. 
     */
    this.getVtxEntities = function(achecker) {
    	return this.getEntities(this.getVtxIDs(achecker));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// End of Vertex-related Methods //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////// Section 2. Edge-related Methods ////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * add an edge.
     * @param {string} id - id for the edge. 
     * @param {string} src_id - a source id that can be for a vertex or an edge. 
     * @param {string} dst_id - a destination id that can be for a vertex or an edge. 
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
     * get all edge IDs satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection 
     * @return a set of edges ids. 
     */
    this.getEdgeIDs = function(achecker) {
        var result = [];
        for(id in this.VE) { 
            if(this.isEdgeID(id)) {
                if(!achecker || achecker(this.VE[id]))
                      result.push(id);  
            } 
        }
        return result;
    }
    

    /**
     * get all edge entities satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection 
     * @return a set of edges ids. 
     */
    this.getEdgeEntities = function(achecker) { 
        return this.getEntities(this.getEdgeIDs(achecker));
    }

    /**
      * get the source id of an edge 
      * @param {string} eid - the edge id. 
      * @return source id (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeSourceID = function(eid) {
        return this.getEntityAttribute(eid, this.S_src); 
    }
    /**
      * get the source entity of an edge 
      * @param {string} eid - the edge id. 
      * @return source entity (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeSourceEntity = function(eid) {
        return this.getEntity(this.getEdgeSourceID(eid)); 
    }
    

    /**
      * get the destination id of an edge 
      * @param {string} eid - the edge id. 
      * @return destination id (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeDestinationID = function(eid) {
        return this.getEntityAttribute(eid, this.S_dst); 
    }

     /**
      * get the destination entity of an edge 
      * @param {string} eid - the edge id. 
      * @return destination entity (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeDestinationEntity = function(eid) {
        return this.getEntity(this.getEdgeDestinationID(eid)); 
    } 

    /**
     * get a list of incoming edge ids.
     * @param {string} to_v a vertex id to which edges are coming in. 
     * @param echecker an edge checker. 
     * @return an array of incoming edge to to_v in terms of echecker. 
     */ 
    this.getIncomingEdgeIDs = function(to_v, echecker) { 
        var result = []
        if (!(to_v in this.VE)) {   
            throw new Error(to_v + " is not a vertex!"); 
        }
        else if (to_v in this.BE) {
            var edge_ids = this.BE[to_v];
            for (var ii=0; edge_ids && ii<edge_ids.length; ii++) {
                var edge_id = edge_ids[ii];
                var edge = this.VE[edge_id];
                if (!echecker || echecker(edge))
                    result.push(edge_id);
            }
        }
        return result;
    } 
 	/**
     * get a list of incoming edge entities.
     * @param {string} to_v a vertex id to which edges are coming in. 
     * @param echecker an edge checker. 
     * @return an array of incoming edge entities to to_v in terms of echecker. 
     */ 
    this.getIncomingEdgeEntities = function(to_v, echecker) {  
        return this.getEntities(this.getIncomingEdgeIDs(to_v, echecker));
    } 
    /**
     * get a list of outgoing edge ids.
     * @param {string} from_v a vertex id from which edges are going from. 
     * @param echecker an edge checker. 
     * @return an array of outgoing edge from from_v in terms of echecker. 
     */ 
    this.getOutgoingEdgeIDs = function(from_v, echecker) { 
        var result = [];
        if (!(from_v in this.VE ) ) {   
            throw new Error(from_v + " is not a vertex!"); 
        }
        else if (from_v in this.FE) {
            var edge_ids = this.FE[from_v];
            for (var ii=0; edge_ids && ii<edge_ids.length; ii++) {
                var edge_id = edge_ids[ii];
                var edge = this.VE[edge_id];
                if (!echecker || echecker(edge))
                    result.push(edge_id);
            }
        }
        return result;
    } 
	/**
     * get a list of outgoing edge entities.
     * @param {string} from_v a vertex id from which edges are going from. 
     * @param echecker an edge checker. 
     * @return an array of outgoing edge entities from from_v in terms of echecker. 
     */ 
    this.getOutgoingEdgeEntities = function(from_v, echecker) { 
    	return this.getEntities(getOutgoingEdgeIDs(from_v, echecker));
    }
    /**
     * get all paths that have their final destination is to_v, and satisfy the optional condition echecker
     * @param to_v is the final destinations of all paths
     * @param echecker is an edge checker
     * @return the set of paths(sequence of edge ids) in which the destination of the last edge is to_v
     */
    this.getTIncomingEdgeIDs = function(to_v, echecker) { 
        let resultE =[];  
        let Visited = {} // map  
        let T = [to_v];  // test set 
        while(T.length>0)
        {
            var v = T[0]; T.shift();  Visited[v]=true;
            var getIncomingEdgeIDs = this.getIncomingEdgeIDs(v,  echecker); // getOutgoingEdgeIDs is an array  
            for(var k in getIncomingEdgeIDs) {
                var ieid = getIncomingEdgeIDs[k]; // an output edge id from from_v in terms of echecker 
                if(!Visited[ieid])
                    resultE.push(ieid);
                Visited[ieid] = true;
                var srcOfie = this.getEdgeSourceID(ieid); // the destination vertex of oeid 
                if(!Visited[srcOfie])  // not visited yet 
                    T.push(srcOfie); //  
            }
        }  
        return resultE; 
    } 
	/**
     * get all paths that have their final destination is to_v, and satisfy the optional condition echecker
     * @param to_v is the final destinations of all paths
     * @param echecker is an edge checker
     * @return the set of paths(sequence of edges) in which the destination of the last edge is to_v
     */
    this.getTIncomingEdgeEntities = function(to_v, echecker) { 
    	return this.getEntities(this.getTIncomingEdgeIDs(o_v, echecker));
    }
    /**
     * get all paths that have their origin is from_v, and satisfy the optional condition echecker
     * @param from_v is the origin of all paths
     * @param echecker is an edge checker
     * @return the set of paths(sequence of edge ids) in which the source of the edge is from_v
     */
    this.getTOutgoingEdgeIDs = function(from_v, echecker) { 
        let resultE =[];  
        let Visited = {} // map  
        let T = [from_v];  // test set 
        while(T.length>0)
        {
            var v = T[0]; T.shift();  Visited[v]=true;
            var getOutgoingEdgeIDs = this.getOutgoingEdgeIDs(v,  echecker); // getOutgoingEdgeIDs is an array  
            for(var k in getOutgoingEdgeIDs) {
                var oeid = getOutgoingEdgeIDs[k]; // an output edge id from from_v in terms of echecker 
                if(!Visited[oeid])
                    resultE.push(oeid);
                Visited[oeid] = true;
                var dstOfie = this.getEdgeDestinationID(oeid); // the destination vertex of oeid 
                if(!Visited[dstOfie])  // not visited yet 
                    T.push(dstOfie); //  
            }
        }   
        return resultE;
    } 
	 /**
     * get all paths that have their origin is from_v, and satisfy the optional condition echecker
     * @param from_v is the origin of all paths
     * @param echecker is an edge checker
     * @return the set of paths(sequence of edges) in which the source of the edge is from_v
     */
    this.getTOutgoingEdgeEntities = function(from_v, echecker) { 
    	return this.getEntities(this.getTOutgoingEdgeIDs(from_v, echecker));
    }

     /**
     * get all source vertex ids that have their target as to_v, and satisfy the optional condition echecker
     * @param to_v
     * @param echecker
     * @return the set of vertex ids
     */
    this.getIncomingVtxIDs = function(to_v, echecker) {
        var result = [];
        var BE = this.getIncomingEdgeIDs(to_v, echecker); // 
        for (var ii in BE) {
            var beid = BE[ii];
            var src_id = this.getEdgeSourceID(beid);
            if (src_id)
                result.push(src_id);
        }
        return result;
    }
 	/**
     * get all source vertices that have their target as to_v, and satisfy the optional condition echecker
     * @param to_v
     * @param echecker
     * @return the set of vertex entities
     */
    this.getIncomingVtxEntities = function(to_v, echecker) {
    	return this.getEntities(this.getIncomingVtxIDs(to_v, echecker));
    }
    /**
     * get all destination vertices that have their target as from_v, and satisfy the optional condition echecker
     * @param from_v
     * @param echecker
     * @return the set of vertex ids
     */
    this.getOutgoingVtxIDs = function(from_v, echecker) {
        var result = [];
        var FE = this.getOutgoingEdgeIDs(from_v, echecker); // 
        for (var ii in FE) {
            var feid = FE[ii];
            var dst_id = this.getEdgeDestinationID(feid);
            if (dst_id)
                result.push(dst_id);
        }
        return result;
    }
     /**
     * get all destination vertices that have their target as from_v, and satisfy the optional condition echecker
     * @param from_v
     * @param echecker
     * @return the set of vertex entities
     */
    this.getOutgoingVtxEntities = function(from_v, echecker) {
    	return this.getEntities(this.getOutgoingVtxIDs(from_v, echecker));
    }
    /**
     * get all transitive inputting vertex ids of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive inputting vertex ids (always non null).
     */
    this.getTIncomingVtxIDs = function(vtx, echecker) {
        var answer = [];
        var T = [vtx];  
        var Visited ={}; // map. 
        while(T.length>0) {
            var v = T[0]; T.shift();  Visited[v]=true;
            var iV = this.getIncomingVtxIDs(v, echecker); // getIncomingVtxIDs 
            for(var ii in iV) { 
                var v = iV[ii];
                answer.push(v);
                if( !(v in Visited) ) // v has not been visited yet. 
                    T.push(v);
            }// for 
        }// while 
        return answer;
    }
     /**
     * get all transitive inputting vertex ids of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive inputting vertex ids (always non null).
     */
    this.getTIncomingVtxEntities = function(vtx, echecker) {
    	return this.getEntities(this.getTIncomingVtxIDs(vtx, echecker));
    }
    /**
     * get all transitive outputting vertex ids of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive outputting vertex ids (always non null).
     */
    this.getTOutgoingVtxIDs = function(vtx, echecker) {
        var answer = [];
        var T = [vtx];  
        var Visited ={}; // map. 
        while(T.length>0) {
            var v = T[0]; T.shift();  Visited[v]=true;
            var oV = this.getOutgoingVtxIDs(v, echecker); // getIncomingVtxIDs 
            for(var ii in oV) { 
                var v = oV[ii];
                answer.push(v);
                if( !(v in Visited) ) // v has not been visited yet. 
                    T.push(v);
            }// for 
        }// while 
        return answer;
    }
     /**
     * get all transitive outputting vertex entities of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive outputting vertex entities (always non null).
     */
    this.getTOutgoingVtxEntities = function(vtx, echecker) {
    	return this.getEntities(this.getTOutgoingVtxIDs(vtx, echecker));
    }

    this.entityToString = function(entity) { 
        var answer = "";
        var i=0;
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

        console.log("* getOutgoingVtxIDs(1)="+JSON.stringify(g.getOutgoingVtxIDs("1")));
        console.log("* getOutgoingEdgeIDs(1)="+JSON.stringify(g.getOutgoingEdgeIDs("1")));
        console.log("* getTOutgoingEdgeIDs(1)="+JSON.stringify(g.getTOutgoingEdgeIDs("1")));
        console.log("* getIncomingVtxIDs(3)="+JSON.stringify(g.getIncomingVtxIDs("3")));
        console.log("* getIncomingEdgeIDs(3)="+JSON.stringify(g.getIncomingEdgeIDs("3")));
        console.log("* getTIncomingEdgeIDs(3)="+JSON.stringify(g.getTIncomingEdgeIDs("3")));
        console.log("* getIncomingVtxIDs(4)="+JSON.stringify(g.getIncomingVtxIDs("4")));
        console.log("* getIncomingEdgeIDs(4)="+JSON.stringify(g.getIncomingEdgeIDs("4")));
        console.log("* getTIncomingEdgeIDs(4)="+JSON.stringify(g.getTIncomingEdgeIDs("4")));
    }
} else {
    // in browser 
}