/**
 * Creates a train (engine or car) and allows for modifications of its state
 * 
 */
var Target = function(two, xCenter, yCenter, radius, color) {

    // Instance variables
    var targetId;
    var targetDOM;
    var target;

    var hasCar = false;

    var remove = function(){
        two.remove(target);
        two.update();
    }

    var setHasCar = function(bool){
        hasCar = bool;
    }

    var getColor = function(){
        return color;
    }

    //====== Initialization ===============
    var init = (function() {
        target = two.makePolygon(xCenter, yCenter, radius*.75, 6);
        //target = two.makeRoundedRectangle(xCenter, yCenter, 40, 20, 3);
        target.fill = color;

        two.update();
    })();

    return {
        remove: remove,
        setHasCar: setHasCar,
        getColor: getColor,
        target: target
    };
}