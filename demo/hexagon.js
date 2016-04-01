/**
 * Creates a hexagon and allows for modifications of hexagon state
 * 
 * TODO: does it also include manipulation such as update()? who knows...
 */
var Hexagon = function(two, xCenter, yCenter, radius) {

    // Instance variables
    var hexagonId;
    var hexagonDOM;
    var hexagon;

    // paths
    var pathLines = {
        1: null,
        2: null,
        3: null
    };


    //====== Public Methods ===============

    var getId = function() {
        return hexagonId;
    };

    var hoverMode = function(isHover) {
        if (isHover) {
            hexagonDOM.addClass('hover');
        } else {
            hexagonDOM.removeClass('hover');
        }
    };

    var clickedMode = function(isClicked) {
        if (isClicked) {
            hoverMode(false);
            hexagonDOM.addClass('clicked');
        } else {
            hexagonDOM.removeClass('clicked');
        }
    };

    var doesPathExist = function(edge1, edge2) {
        if (edge1 > edge2) {
            return doesPathExist(edge2, edge1);
        }

        return (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] !== null);
    }

    var drawPath = function(edge1, edge2) {
        if (edge1 > edge2) {
            return drawPath(edge2, edge1);
        }

        if (doesPathExist(edge1,edge2)){
            return;
        }
        if (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] === null) {

            var line = drawLine(edge1, edge2);
            pathLines[edge1] = line;
        } else {
            console.log('Unable to draw such line now from edge ' + edge1 + ' to ' + edge2);
        }
    };

    var removePath = function(edge1, edge2) {
        if (edge1 > edge2) {
            return removePath(edge2, edge1);
        }

        if (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] !== null) {
            two.remove(pathLines[edge1]);
            pathLines[edge1] = null;
        } else {
            //console.log('Unable to remove line from edge ' + edge1 + ' to ' + edge2);
        }
    }

    var remove = function(){
        two.remove(hexagon)
        removeLines();
        two.update();
    };

    var removeLines = function(){
        removePath(1,4);
        removePath(3,6);
        removePath(2,5);
        two.update();
    }

    var getPosition = function(){
        return {x: xCenter, y: yCenter};
    }

    var setFill = function(fill){
        hexagon.fill = fill;
        two.update();
    }

    var rotate = function(angle){
        hexagon.rotation = angle;
        two.update();
    }

    //====== Private Methods ==============

    var drawLine = function(edge1, edge2) {
        var dx;
        var dy;
        if (edge1 === 1) {
            dx = -radius*Math.sqrt(3)/4;
            dy = -radius*0.75
        } else if (edge1 === 2) {
            dx = radius*Math.sqrt(3)/4;
            dy = -radius*0.75;
        } else {
            dx = radius*Math.sqrt(3)/2;
            dy = 0;
        }

        var x1 = xCenter + dx;
        var y1 = yCenter + dy;
        var x2 = xCenter - dx;
        var y2 = yCenter - dy;

        var line = two.makePath(x1, y1, x2, y2, true);
        two.update();

        return line;
    }

    //====== Initialization ===============
    var init = (function() {
        // Create hexagon
        hexagon = two.makePolygon(xCenter, yCenter, radius, 6);
        hexagon.fill = '#eeeeee';
        hexagon.stroke = '#aaaaaa';
        hexagon.linewidth = 1;
        hexagon.rotation = Math.PI / 6;
        two.update();
        // Instantiate instance variables
        hexagonId = hexagon.id;
        hexagonDOM = $("#" + hexagonId);
    })();

    return {
        getId: getId,
        hoverMode: hoverMode,
        clickedMode: clickedMode,
        doesPathExist: doesPathExist,
        drawPath: drawPath,
        removePath: removePath,
        remove: remove,
        removeLines: removeLines,
        getPosition: getPosition,
        setFill: setFill,
        rotate: rotate
    };
}