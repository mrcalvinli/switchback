/**
 * Creates a train (engine or car) and allows for modifications of its state
 * 
 */
var Train = function(two, path, color, engine) {

    // Instance variables
    var trainId;
    var trainDOM;
    var train;

    var isEngine;

    var type;
    var currentPath;

    var moveOnPath = function(t){
        currentPath.translateOnCurve(t,train);
    }

    var remove = function(){
        two.remove(train);
        two.update();
    }

    var getPath = function(){
        return path;
    }

    var setPath = function(newPath){
        currentPath = newPath;
    }

    //====== Initialization ===============
    var init = (function() {
        // Create hexagon
        var pos = path.getPointAt(.5);
        var rect;
        if (engine) {
            rect = two.makeRoundedRectangle(pos.x, pos.y, 40, 20, 3);
            rect.fill = color;
        } else {
            rect.stroke = color;
            rect.noFill();
        }


        var deriv = path.calcDerivAt(0.5);

        rect.rotation = Math.atan2(deriv.dy, deriv.dx);
        

        path.translateOnCurve(0.5, rect);

        currentPath = path;
        type = color;
        isEngine = engine;
        train = rect;

        //console.log(arcLines[e1].getPointAt(0.5));
        //console.log(pathLines[e1].translation);

        //train.edge = e1;
        two.update();
    })();

    return {
        isEngine: isEngine,
        remove: remove,
        moveOnPath: moveOnPath,
        setPath: setPath,
        getPath: getPath

    };
}