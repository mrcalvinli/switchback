/**
 * Creates a train (engine or car) and allows for modifications of its state
 * 
 * @param isForward - true if is going on positive direction of path, false otherwise
 */
var Train = function(two, path, color, engine, isForward) {

    // Instance variables
    var trainId;
    var trainDOM;
    var train;

    var isEngine;

    var type;
    var currentPath;

    //====== Instance Methods ==================

    var instMethods = {};

    var moveOnPath = instMethods.moveOnPath = function(t){
        currentPath.translateOnCurve(t,train);
    }

    var remove = instMethods.remove = function(){
        two.remove(train);
        two.update();
    }

    /**
     * Gets whether the train is facing forward or not
     */
    var isFacingForward = instMethods.isFacingForward = function() {
        return isForward;
    }

    /** 
     * Sets direction train is facing, forwards or backwards
     *
     * @param isForwardInput - true if facing forward, false if backwards
     */
    var setFacingDirection = instMethods.setFacingDirection = function(isForwardInput) {
        isForward = isForwardInput;
    }

    var getPath = instMethods.getPath = function(){
        return currentPath;
    }

    var setPath = instMethods.setPath = function(newPath){
        currentPath = newPath;
    }

    var translate = instMethods.translate = function(dx, dy){
        train.translation.x+=dx;
        train.translation.y+=dy;
    }

    //====== Initialization ===============
    var init = (function() {
        //set default direction of train
        if (isForward === undefined) {
            isForward = true;
        }

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

        /*var deriv = path.calcDerivAt(.5);
        train.rotation = Math.atan2(deriv.dy, deriv.dx);*/
        

        path.translateOnCurve(0.5, train, isForward);


        currentPath = path;
        type = color;
        isEngine = engine;
        //train = rect;


        //console.log(arcLines[e1].getPointAt(0.5));
        //console.log(pathLines[e1].translation);

        //train.edge = e1;
        two.update();
    })();

    instMethods.isEngine = isEngine;
    instMethods.color = type;
    instMethods.train = train;

    return instMethods;
}