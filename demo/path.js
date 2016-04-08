/**
 * Creates a path object
 * 
 */
var Path = function(two, path, edge1, edge2) {

    // Instance variables

    var calcDerivAt = function(t){
        var beg = path.getPointAt(t-.01).addSelf(path.translation);
        var end = path.getPointAt(t+.01).addSelf(path.translation);
        var delty = end.y - beg.y;
        var deltx = end.x - beg.x;
        return {dx:deltx, dy:delty};
    }

    var getPointAt = function(t){
        return path.getPointAt(t).addSelf(path.translation);
    }
    
    var getStartEdge = function(){
        return edge1;
    }

    var getEndEdge = function(){
        return edge2;
    }

    var remove = function(){
        two.remove(path);
        two.update();
    }

    var translateOnCurve = function(t, obj){
        path.getPointAt(t, obj.translation);
        obj.translation.addSelf(path.translation);
    }

    //====== Initialization ===============
    var init = (function() {

    })();

    return {
        getPointAt: getPointAt,
        getStartEdge:getStartEdge,
        getEndEdge: getEndEdge,
        translateOnCurve: translateOnCurve,
        calcDerivAt: calcDerivAt,
        remove: remove
    };
}