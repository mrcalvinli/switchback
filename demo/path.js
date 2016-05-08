/**
 * Creates a path object
 * 
 */
var Path = function(two, path, edge1, edge2) {

    // Instance variables

    var calcDerivAt = function(t){
        var smallerT = (t - 0.01) > 0 ? t - 0.01 : t;
        var largerT = (t + 0.01) < 1 ? t + 0.01 : t;
        var beg = path.getPointAt(smallerT).addSelf(path.translation);
        var end = path.getPointAt(largerT).addSelf(path.translation);
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

    /**
     * Translates the object on the curve (straight or arc) at t-th 
     * part of the curve. t ranges from 0 to 1, exclusively, where smaller
     * values are closer to the start point of the curve (i.e. values of t
     * approaching 0 will place the object closer to the start point).
     *
     * @param t - position on the curve (0 < t < 1)
     * @param obj - object to place onto curve at given location
     * @param obj - true if object is facing forward on path, false otherwise
     */
    var translateOnCurve = function(t, obj, isForward) {
        if (Math.abs(edge1 - edge2) === 3) {
            var vertices = path.vertices;
            var dy = vertices[1].y - vertices[0].y;
            var dx = vertices[1].x - vertices[0].x;

            var new_x = vertices[0].x + t*dx;
            var new_y = vertices[0].y + t*dy;

            obj.translation.set(new_x, new_y).addSelf(path.translation);
        } else {
            path.getPointAt(t, obj.translation);
            obj.translation.addSelf(path.translation);
        }

        //set obj's angle
        var deriv = calcDerivAt(t)
        obj.rotation = Math.atan2(deriv.dy, deriv.dx);
        if (!isForward) {
            obj.rotation = (obj.rotation + Math.PI) % (2*Math.PI);
        }
    }

    var translate = function(dx, dy){
        path.translation.x+=dx;
        path.translation.y+=dy;
    }

    //====== Initialization ===============
    var init = (function() {

    })();

    return {
        getPointAt: getPointAt,
        getStartEdge:getStartEdge,
        getEndEdge: getEndEdge,
        translateOnCurve: translateOnCurve,
        translate: translate,
        calcDerivAt: calcDerivAt,
        remove: remove
    };
}