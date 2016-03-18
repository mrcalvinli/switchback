/**
 * Creates a hexagon and allows for modifications of hexagon state
 * 
 * TODO: does it also include manipulation such as update()? who knows...
 */
var Hexagon = function(two, xCenter, yCenter, radius) {

    // Instance variables
    var hexagonId;
    var hexagonDOM;


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

    var drawPath = function(edge1, edge2) {
        if (edge1 > edge2) {
            return drawLine(edge2, edge1);
        }

        if (Math.abs(edge1 - edge2) === 3) {
            drawLine(edge1, edge2)
        } else {
            console.log('Unable to draw such line now from edge ' + edge1 + ' to ' + edge2)
        }
    };

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
    }

    //====== Initialization ===============
    var init = (function() {
        // Create hexagon
        var hexagon = two.makePolygon(xCenter, yCenter, radius, 6);
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
        drawPath: drawPath
    };
}