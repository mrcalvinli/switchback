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

    var train = {
        track: null,
        edge: null,
        train: null,
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

    var doesArcExist = function(edge1) {
        return arcLines[edge1] !== null
    }

    var draw = function(type, theta, edge){
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
            if (edge != null){
                drawTrain(edge);
            }
        }
        else if (type === "menu-item-blue"){
            drawTrain(1,e2);
        }
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

    var getTracks = function(){
        var tracks = [];
        for (var i = 1; i <= 3; i++){
            if (pathLines[i] !== null)
                tracks.push(pathLines[i]);
        }
        for (var i = 1; i <= 6; i++){
            if (arcLines[i] !== null)
                tracks.push(arcLines[i]);
        }
        return tracks;
    }

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

    var removeTrain = function(){
        two.remove(train.train);
        train.train = null;
        train.track = null;
    }

    var remove = function(){
        two.remove(hexagon)
        removeLines();
        removeTrain();
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

        if (doesArcExist(edge1)){
            return;
        }
        if (Math.abs(edge1 - edge2) % 2 === 0 && arcLines[edge1] === null) {
            var arc = makeArc(edge1, edge2);
            arcLines[edge1] = arc;
        } else {
            console.log('Unable to draw such arc now from edge ' + edge1 + ' to ' + edge2);
        }
    }

    var drawTrain = function(edge){
        var rect = two.makeRoundedRectangle(xCenter, yCenter, 40, 20, 3);


        var deriv = calcDerivAt(edge,0.5);

        rect.rotation = Math.atan2(deriv.dy, deriv.dx);
        rect.fill = "gold";

        translateOnCurve(edge, 0.5, rect);

        if (train.train !== null){
            removeTrain(); 
        }
        train.train = rect;
        train.track = edge;
        //console.log(arcLines[e1].getPointAt(0.5));
        //console.log(pathLines[e1].translation);

        //train.edge = e1;
        two.update();
    }

    var translateOnCurve = function(path, t, obj) {
        path.getPointAt(t, obj.translation);
        obj.translation.addSelf(path.translation);
    }

    var calcDerivAt = function(path, t) {
        var beg = path.getPointAt(t-.01).addSelf(path.translation);
        var end = path.getPointAt(t+.01).addSelf(path.translation);
        var delty = end.y - beg.y;
        var deltx = end.x - beg.x;
        return {dx:deltx, dy:delty};
    }

    var makeArc = function(edge1, edge2) {
        var edgeCenter1 = getSideCoord(edge1);
        var edgeCenter2 = getSideCoord(edge2);

        var anchor1 = new Two.Anchor(edgeCenter1.x, edgeCenter1.y, 0, 0, 
            .75*(xCenter - edgeCenter1.x), .75*(yCenter - edgeCenter1.y), Two.Commands.curve);
        var anchor2 = new Two.Anchor(edgeCenter2.x, edgeCenter2.y, 
            (xCenter - edgeCenter2.x)*.75, .75*(yCenter - edgeCenter2.y), 0, 0, Two.Commands.curve);

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
            y: yCenter + dy,
            theta: angleFromCenter
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
        getTracks: getTracks,
        removePath: removePath,
        remove: remove,
        removeLines: removeLines,
        removeTrain: removeTrain,
        getPosition: getPosition,
        setPosition: setPosition,
        setFill: setFill,
        rotate: rotate
    };
}