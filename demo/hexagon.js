/**
 * Creates a hexagon and allows for modifications of hexagon state
 * 
 * TODO: does it also include manipulation such as update()? who knows...
 */
var Hexagon = function(two, xCenter, yCenter, radius, xIndex, yIndex) {

    // Instance variables
    var hexagonId;
    var hexagonDOM;
    var hexagon;

    // paths
    var pathLines = {
        0: null,
        1: null,
        2: null
    };

    var arcLines = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null
    };

    var train = null;


    //====== Public Methods ===============

    var instMethods = {};

    var getId = instMethods.getId = function() {
        return hexagonId;
    };

    var hoverMode = instMethods.hoverMode = function(isHover) {
        if (isHover) {
            hexagonDOM.addClass('hover');
        } else {
            hexagonDOM.removeClass('hover');
        }
    };

    var clickedMode = instMethods.clickedMode = function(isClicked) {
        if (isClicked) {
            hoverMode(false);
            hexagonDOM.addClass('clicked');
        } else {
            hexagonDOM.removeClass('clicked');
        }
    };

    var doesPathExist = instMethods.doesPathExist = function(edge1, edge2) {
        if (edge1 > edge2) {
            return doesPathExist(edge2, edge1);
        }

        return (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] !== null);
    };

    var doesArcExist = instMethods.doesArcExist = function(edge1) {
        return arcLines[edge1] !== null
    };

    var adjacentEdges = instMethods.adjacentEdges = function(edge) {
        var adjacentEdgeList = [];

        // check for straight line paths
        var oppositeEdge = (edge + 3) % 6;
        if (doesPathExist(edge, oppositeEdge)) {
            adjacentEdgeList.push(oppositeEdge);
        }

        // check for arc paths
        if (doesArcExist(edge)) {
            var linkedEdge = (edge + 2) % 6;
            adjacentEdgeList.push(linkedEdge);
        }

        var linkedEdge = (edge + 2) % 6;
        if (doesArcExist(linkedEdge)) {
            adjacentEdgeList.push(linkedEdge);
        }

        return adjacentEdgeList;
    };

    var draw = instMethods.draw = function(item, theta, edge){
        var e1 = 0;
        if (theta > 90 && theta <= 150){
            e1 = 0; 
        }
        else if (theta <= 90 && theta > 30){
            e1 = 1; 
        }
        else if (theta <= 30 && theta > -30){
            e1 = 2; 
        }
        else if (theta <= -30 && theta > -90){
            e1 = 3; 
        }
        else if (theta <= -90 && theta > -150){
            e1 = 4; 
        } else {
            e1 = 5; 
        }
        if (item.id === "menu-item-straight"){
            var e2 = (e1 + 3) % 6;
            drawPath(e1, e2);
        }
        else if (item.id === "menu-item-curved"){
            var e2 = (e1 + 2) % 6;
            drawArc(e1, e2);
        }
        else if (item.train){
            if (edge != null){
                drawTrain(edge, item.color, item.engine);
            }
        }
    };

    //TODO: fix this method to be like drawArc
    var drawPath = instMethods.drawPath = function(edge1, edge2) {
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
            pathLines[edge1] =  Path(two,line,edge1,edge2);
        } else if (Math.abs(edge1 - edge2) % 2 === 0 && arcLines[edge1] === null) {
            var arc = drawArc(edge1, edge2);
        } else {
            console.log('Unable to draw such line now from edge ' + edge1 + ' to ' + edge2);
        }
    };

    var getTracks = instMethods.getTracks = function(){
        var tracks = [];
        for (var i = 0; i < 3; i++){
            if (pathLines[i] !== null)
                tracks.push(pathLines[i]);
        }
        for (var i = 0; i < 6; i++){
            if (arcLines[i] !== null)
                tracks.push(arcLines[i]);
        }
        return tracks;
    };

    var removePath = instMethods.removePath = function(edge1, edge2) {
        if (edge1 > edge2) {
            return removePath(edge2, edge1);
        }

        if (Math.abs(edge1 - edge2) === 3 && pathLines[edge1] !== null) {
            pathLines[edge1].remove();
            pathLines[edge1] = null;
        } else {
            //console.log('Unable to remove line from edge ' + edge1 + ' to ' + edge2);
        }
    };
    
    var removeArc = instMethods.removeArc = function(edge1) {
        if (arcLines[edge1] !== null) {
            arcLines[edge1].remove();
            arcLines[edge1] = null;
        } else {
            //console.log('Unable to remove line from edge ' + edge1 + ' to ' + edge2);
        }
    };

    var removeTrain = instMethods.removeTrain = function(){
        if (train !== null){
            train.remove();
            train = null;
        }
        else {
            //console.log("unable to remove train, reference is null");
        }
    };

    var remove = instMethods.remove = function(){
        two.remove(hexagon)
        removeLines();
        two.update();

    };

    var removeLines = instMethods.removeLines = function(){
        for (var i = 0; i < 3; i++){
            removePath(i, i + 3);
        }
        for (var i = 0; i < 6; i++){
            removeArc(i);
        }
        removeTrain();
        two.update();
    };

    var getPosition = instMethods.getPosition = function(){
        return {x: xCenter, y: yCenter};
    };

    var getPositionIndex = instMethods.getPositionIndex = function() {
        return {xIndex: xIndex, yIndex: yIndex}
    };

    var setFill = instMethods.setFill = function(fill){
        hexagon.fill = fill;
        two.update();
    };

    var rotate = instMethods.rotate = function(angle){
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
            arcLines[edge1] = Path(two,arc,edge1,edge2);
        } else {
            console.log('Unable to draw such arc now from edge ' + edge1 + ' to ' + edge2);
        }
    }

    var drawTrain = function(edge, color, engine){
        if (train != null){
            removeTrain();
        }
        train = Train(two,edge,color,engine);
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
        var angleFromCenter = ((240 + edgeIndex * 60) % 360) * Math.PI/180.0
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

    return instMethods;
}