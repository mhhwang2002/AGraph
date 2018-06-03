/**
  Author: Moon Ho Hwang
  email: {moon.hwang}@gmail.com
  
  Modification History 
     Jan/7/2017: create
     May/12/2018: begin to make it npm a module
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
     * check if the entity of id is a vertex 
     * @param {string} id - an entity id searching for    
     * @return {boolean} true if the entity of id is a vertex; false otherwise.
    */
    this.isVtx = function(id) {
        var ent = this.getEntity(id);
        if(ent) 
            return !((this.S_src in ent) && (this.S_dst in ent));
        else
            throw new Error(id + " doesn't exists.");
    }

    /**
     * check if tht entity of id is an edge.
     * @return {boolean} true if the entity of id is an edge; false otherwise.
    */
    this.isEdge = function(id) {
        var ent = this.getEntity(id);
        if(ent)
            return (this.S_src in ent) && (this.S_dst in ent);
        else
            throw new Error(id + " doesn't exists.");
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
                var inE = this.inE(id, null);
                //console.log("deleting all inE(" + id +")\n"+ graphWriter.Eids2str(inE, this, null)); 
                var outE = this.outE(id, null);
                //console.log("deleting all outE(" + id +")\n"+ graphWriter.Eids2str(outE, this, null));
                for(var ii in inE)
                    delete this.VE[inE[ii]] 
                for(var ii in outE)
                    delete this.VE[outE[ii]] 

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
        var attributes={};
        for(var k in attrs) 
            attributes[k]=attrs[k];
        if(!(this.S_id in attributes)) // if S_id is not defined in attrs 
            attributes[this.S_id]=id; // add S_id as id

        this.VE[id]= attributes; 
        return attributes;
    } 
     
    /**
     * get all vertice IDs satisfied by an checker.
     * @param {function} achecker takes an entity
     * @return a set of vertex ids. 
     */
    this.getVtxs = function(achecker) {
        var result = [];
        for(id in this.VE) { 
            if(this.isVtx(id)) {
                if(achecker != null) {   
                    if(achecker(this.VE[id]))
                      result.push(id); 
                }
                else
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
     * get all edges satisfied by an checker.
     * @param {function} achecker - an edge checker for vertex selection 
     * @return a set of edges ids. 
     */
    this.getEdges = function(achecker) {
        var result = [];
        for(id in this.VE) { 
            if(this.isEdge(id)) {
                if(achecker != null) {   
                    if(achecker(this.VE[id]))
                      result.push(id); 
                }
                else
                    result.push(id);
            } 
        }
        return result;
    }

     /**
      * get the source of an edge 
      * @param {string} eid - the edge id. 
      * @return source id (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeSource = function(eid) {
        return this.getEntityAttribute(eid, this.S_src); 
    }

    ///**
    // * set the source of an edge 
    // * @param {string} eid - the edge id
    // * @param {string} srcId - the source id which should be either one of id of a vertex or an edge 
    // */
    //this.setEdgeSource = function(eid, srcId) {
    //    this.setEntityAttribute(eid, this.S_src, srcId);
    //}

    /**
      * get the destination of an edge 
      * @param {string} edge - the edge id. 
      * @return destination id (indicating either one of a vertex or an edge). null if not available. 
      */
    this.getEdgeDestination = function(eid) {
        return this.getEntityAttribute(eid, this.S_dst); 
    }

     // /**
    // * set the destination of an edge 
    // * @param {string} eid - the edge id
    // * @param {string} dstId - the destination id which should be either one of id of a vertex or an edge 
    // */
    // this.setEdgeDestination = function(eid, dstId) {
        // this.setEntityAttribute(eid, this.S_dst, dstId);
    // } 

    /**
     * get a list of incoming edge ids.
     * @param {string} to_v a vertex id to which edges are coming in. 
     * @param echecker an edge checker. 
     * @return an array of incoming edge to to_v in terms of echecker. 
     */ 
    this.inE = function(to_v, echecker) { 
        var result = []
        if (!(to_v in this.VE)) {   
            throw new Error(to_v + " is not a vertex!"); 
        }
        else if (to_v in this.BE) {
            var edge_ids = this.BE[to_v];
            for (var ii=0; edge_ids && ii<edge_ids.length; ii++) {
                var edge_id = edge_ids[ii];
                var edge = this.VE[edge_id];
                if (echecker == null || echecker(edge))
                    result.push(edge_id);
            }
        }
        return result;
    } 

    /**
     * get a list of outgoing edge ids.
     * @param {string} from_v a vertex id from which edges are going from. 
     * @param echecker an edge checker. 
     * @return an array of outgoing edge from from_v in terms of echecker. 
     */ 
    this.outE = function(from_v, echecker) { 
        var result = [];
        if (!(from_v in this.VE ) ) {   
            throw new Error(from_v + " is not a vertex!"); 
        }
        else if (from_v in this.FE) {
            var edge_ids = this.FE[from_v];
            for (var ii=0; edge_ids && ii<edge_ids.length; ii++) {
                var edge_id = edge_ids[ii];
                var edge = this.VE[edge_id];
                if (echecker == null || echecker(edge))
                    result.push(edge_id);
            }
        }
        return result;
    } 

    /**
     * get all paths that have their final destination is to_v, and satisfy the optional condition echecker
     * @param to_v is the final destinations of all paths
     * @param echecker is an edge checker
     * @return the set of paths(sequence of edges) in which the destination of the last edge is to_v
     */
    this.TinE = function(to_v, echecker) { 
        let resultE =[];  
        let Visited = {} // map  
        let T = [to_v];  // test set 
        while(T.length>0)
        {
            var v = T[0]; T.shift();  Visited[v]=true;
            var inE = this.inE(v,  echecker); // outE is an array  
            for(var k in inE) {
                var ieid = inE[k]; // an output edge id from from_v in terms of echecker 
                if(!Visited[ieid])
                    resultE.push(ieid);
                Visited[ieid] = true;
                var srcOfie = this.getEdgeSource(ieid); // the destination vertex of oeid 
                if(!Visited[srcOfie])  // not visited yet 
                    T.push(srcOfie); //  
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
    this.ToutE = function(from_v, echecker) { 
        let resultE =[];  
        let Visited = {} // map  
        let T = [from_v];  // test set 
        while(T.length>0)
        {
            var v = T[0]; T.shift();  Visited[v]=true;
            var outE = this.outE(v,  echecker); // outE is an array  
            for(var k in outE) {
                var oeid = outE[k]; // an output edge id from from_v in terms of echecker 
                if(!Visited[oeid])
                    resultE.push(oeid);
                Visited[oeid] = true;
                var dstOfie = this.getEdgeDestination(oeid); // the destination vertex of oeid 
                if(!Visited[dstOfie])  // not visited yet 
                    T.push(dstOfie); //  
            }
        }   
        return resultE;
    } 

     /**
     * get all source vertices that have their target as to_v, and satisfy the optional condition echecker
     * @param to_v
     * @param echecker
     * @return
     */
    this.inV = function(to_v, echecker) {
        var result = [];
        var BE = this.inE(to_v, echecker); // 
        for (var ii in BE) {
            var beid = BE[ii];
            var src_id = this.getEdgeSource(beid);
            if (src_id)
                result.push(src_id);
        }
        return result;
    }

    /**
     * get all destination vertices that have their target as from_v, and satisfy the optional condition echecker
     * @param from_v
     * @param echecker
     * @return
     */
    this.outV = function(from_v, echecker) {
        var result = [];
        var FE = this.outE(from_v, echecker); // 
        for (var ii in FE) {
            var feid = FE[ii];
            var dst_id = this.getEdgeDestination(feid);
            if (dst_id)
                result.push(dst_id);
        }
        return result;
    }
    /**
     * get all transitive inputting vertices of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive inputting vertices (always non null).
     */
    this.TinV = function(vtx, echecker) {
        var answer = [];
        var T = [vtx];  
        var Visited ={}; // map. 
        while(T.length>0) {
            var v = T[0]; T.shift();  Visited[v]=true;
            var iV = this.inV(v, echecker); // inV 
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
     * get all transitive outputting vertices of a vertex vtx in terms of edge type
     * @param vtx is a vertex
     * @param edgetype is the edge type
     * @return all transitive outputting vertices (always non null).
     */
    this.ToutV = function(vtx, echecker) {
        var answer = [];
        var T = [vtx];  
        var Visited ={}; // map. 
        while(T.length>0) {
            var v = T[0]; T.shift();  Visited[v]=true;
            var oV = this.outV(v, echecker); // inV 
            for(var ii in oV) { 
                var v = oV[ii];
                answer.push(v);
                if( !(v in Visited) ) // v has not been visited yet. 
                    T.push(v);
            }// for 
        }// while 
        return answer;
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

        console.log("* outV(1)="+JSON.stringify(g.outV("1")));
        console.log("* outE(1)="+JSON.stringify(g.outE("1")));
        console.log("* ToutE(1)="+JSON.stringify(g.ToutE("1")));
        console.log("* inV(3)="+JSON.stringify(g.inV("3")));
        console.log("* inE(3)="+JSON.stringify(g.inE("3")));
        console.log("* TinE(3)="+JSON.stringify(g.TinE("3")));
        console.log("* inV(4)="+JSON.stringify(g.inV("4")));
        console.log("* inE(4)="+JSON.stringify(g.inE("4")));
        console.log("* TinE(4)="+JSON.stringify(g.TinE("4")));
    }
} else {
    // in browser 
}