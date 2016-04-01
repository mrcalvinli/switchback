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

    var arcLines = {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null
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
        if (edge1 === edge2) {
            return;
        }
        if (edge1 > edge2) {
            return drawPath(edge2, edge1);
        }

        if (doesPathExist(edge1,edge2)){
            return;
        }
        if (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] === null) {

            var line = drawLine(edge1, edge2);
            pathLines[edge1] = line;
        } else if (Math.abs(edge1 - edge2) % 2 === 0 && arcLines[edge1] === null) {
            var arc = drawArc(edge1, edge2);
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
    };
    var removeArc = function(edge1) {
        if (arcLines[edge1] !== null) {
            two.remove(arcLines[edge1]);
            arcLines[edge1] = null;
        } else {
            //console.log('Unable to remove line from edge ' + edge1 + ' to ' + edge2);
        }
    };

    var remove = function(){
        two.remove(hexagon)
        removeLines();
        two.update();
    };

    var removeLines = function(){
        removePath(1,4);
        removePath(3,6);
        removePath(2,5);
        for (var i =1; i<=6;i++){
            removeArc(i);
        }
        two.update();
    }

    var getPosition = function(){
        return {x: xCenter, y: yCenter};
    };

    var setPosition = function(x, y){
        var dx = x - xCenter;
        var dy = y - yCenter;
        xCenter = x;
        yCenter = y;
        hexagon.target.set(x,y);
    };

    var setFill = function(fill){
        hexagon.fill = fill;
        two.update();
    };

    var rotate = function(angle){
        hexagon.rotation = angle;
        two.update();
    };

    var draw = function(type, theta){
        var e1 = 1;
        if (theta > 90 && theta <= 150){
            e1 = 1; 
        }
        else if (theta <= 90 && theta > 30){
            e1 = 2; 
        }
        else if (theta <= 30 && theta > -30){
            e1 = 3; 
        }
        else if (theta <= -30 && theta > -90){
            e1 = 4; 
        }
        else if (theta <= -90 && theta > -150){
            e1 = 5; 
        } else {
            e1 = 6; 
        }
        if (type === "menu-item-straight"){
            var e2 = (e1 +2)%6+1;
            drawPath(e1,e2);
        }
        else if (type === "menu-item-curved"){
            var e2 = (e1+1)%6+1;
            drawArc(e1, e2);
        }
        else if (type === "menu-item-gold"){
            drawTrain(e1,e2);
        }
        else if (type === "menu-item-blue"){
            drawTrain(1,e2);
        }
    }

    //====== Private Methods ==============

    var drawLine = function(edge1, edge2) {
        var edgeCenter1 = getSideCoord(edge1);
        var edgeCenter2 = getSideCoord(edge2);

        var line = two.makePath(edgeCenter1.x, edgeCenter1.y, edgeCenter2.x, edgeCenter2.y, true);
        two.update();

        return line;
    }

    var drawArc = function(edge1, edge2) {
        if (edge1 === edge2) {
            return;
        }
        if (edge1 > edge2) {
            return drawArc(edge2, edge1);
        }

        if (doesPathExist(edge1,edge2)){
            return;
        }
        if (Math.abs(edge1 - edge2) % 2 === 0 && arcLines[edge1] === null) {
            var arc = makeArc(edge1, edge2);
            arcLines[edge1] = arc;
        } else {
            console.log('Unable to draw such arc now from edge ' + edge1 + ' to ' + edge2);
        }
    }

    var makeArc = function(edge1, edge2) {
        var edgeCenter1 = getSideCoord(edge1);
        var edgeCenter2 = getSideCoord(edge2);

        var anchor1 = new Two.Anchor(edgeCenter1.x, edgeCenter1.y, 0, 0, 
            .75*(xCenter - edgeCenter1.x), .75*(yCenter - edgeCenter1.y), Two.Commands.curve);
        var anchor2 = new Two.Anchor(edgeCenter2.x, edgeCenter2.y, 
            (xCenter - edgeCenter2.x)*.75, .75*(edgeCenter2.y - yCenter), 0, 0, Two.Commands.curve);

        var path = two.makeCurve([anchor1, anchor2], true);
       
        path.fill = 'rgba(0,0,0,0)';

        two.update();

        return path;
    }

    var getSideCoord = function(edgeIndex) {
        var angleFromCenter = ((240 + (edgeIndex - 1)*60) % 360) * Math.PI/180.0
        var distToEdge = radius*Math.sqrt(3)/2.0;
        var dx = distToEdge * Math.cos(angleFromCenter);
        var dy = distToEdge * Math.sin(angleFromCenter);

        return {
            x: xCenter + dx,
            y: yCenter + dy
        }
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
        draw: draw,
        drawPath: drawPath,
        removePath: removePath,
        remove: remove,
        removeLines: removeLines,
        getPosition: getPosition,
        setPosition: setPosition,
        setFill: setFill,
        rotate: rotate
    };
}