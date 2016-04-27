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
        return currentPath;
    }

    var setPath = function(newPath){
        currentPath = newPath;
    }

    var translate = function(dx, dy){
        train.translation.x+=dx;
        train.translation.y+=dy;
    }

    //====== Initialization ===============
    var init = (function() {
        // Create hexagon
        var pos = path.getPointAt(.5);
        //var rect = two.makeRoundedRectangle(pos.x, pos.y, 40, 20, 3);
        if (engine) {
            var rect = two.makeRoundedRectangle(0, 0, 40, 20, 3);
            rect.fill = color;

            var triangle = two.makePolygon(10, 0, 8, 3);
            triangle.fill = "black";
            triangle.rotation = -Math.PI/6;

            var group = two.makeGroup(rect, triangle);
            group.translation.set(pos.x, pos.y);
            train = group;

        } else {
            var rect = two.makeRoundedRectangle(pos.x, pos.y, 40, 20, 3);
            rect.fill = color;
            train = rect;
        }


        currentPath = path;
        type = color;
        isEngine = engine;

        //train.rotation = Math.atan2(deriv.dy, deriv.dx);
        

        path.translateOnCurve(0.5, train);

        currentPath = path;
        type = color;
        isEngine = engine;
        //train = rect;


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
        getPath: getPath,
        color: type,
        translate: translate,
        train: train

    };
}