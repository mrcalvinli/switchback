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

    // Track Paths
    var linePaths = {
        0: null,
        1: null,
        2: null
    };

    var arcPaths = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null
    };

    var train = null;

    var target = null;


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

    var setPosition = instMethods.setPosition = function(x,y) {
        var dx = x - hexagon.translation.x;
        var dy = y - hexagon.translation.y;
        hexagon.translation.x=x;
        hexagon.translation.y=y;
        for (var i = 0; i < 3; i++){
            if (linePaths[i] !== null)
                linePaths[i].translate(dx,dy);
        }
        for (var i = 0; i < 6; i++){
            if (arcPaths[i] !== null)
                arcPaths[i].translate(dx,dy);
        }
        if (train !== null)
            train.translate(dx,dy);
        two.update();
    }

    var copy = instMethods.copy = function(){
        var newHex = new Hexagon(two, hexagon.translation.x, hexagon.translation.y, radius);
        for (var i = 0; i<3; i++){
            if (linePaths[i] !== null){
                newHex.drawLineTrack(i, (i+3)%6);
            }
            if (train !== null){
                var e1 = train.getPath().getStartEdge();
                var e2 = train.getPath().getEndEdge();
                if (Math.abs(e1-e2) === 3 && e1 === i) {
                    newHex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                    newHex.getTracks()[0]);
                }
            }
        }
        
        for (var i = 0; i<6; i++){
            if (arcPaths[i] !== null){
                newHex.drawArcTrack(i, (i+2)%6);
            }
            if (train !== null){
                var e1 = train.getPath().getStartEdge();
                var e2 = train.getPath().getEndEdge();
                if ((e1-e2)%2 === 0 && e1 === i) {
                    newHex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                        newHex.getTracks()[0]);
                }
            }
        }
        two.update();
        
        
        return newHex;
    };

    var echo = instMethods.echo = function(hex){
        hex.removeLines();
        for (var i = 0; i<3; i++){
            if (linePaths[i] !== null){
                hex.drawLineTrack(i, (i+3)%6);
            }
            if (train !== null){
                var e1 = train.getPath().getStartEdge();
                var e2 = train.getPath().getEndEdge();
                if (Math.abs(e1-e2) === 3 && e1 === i) {
                    hex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                    hex.getTracks()[0]);
                }
            }
        }
        
        for (var i = 0; i<6; i++){
            if (arcPaths[i] !== null){
                hex.drawArcTrack(i, (i+2)%6);
            }
            if (train !== null){
                var e1 = train.getPath().getStartEdge();
                var e2 = train.getPath().getEndEdge();
                if ((e1-e2)%2 === 0 && e1 === i) {
                    hex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                        hex.getTracks()[0]);
                }
            }
        }
        two.update();

    };

    var rotateLeft = instMethods.rotateLeft = function(){
        dir = -1;
        var newHex = new Hexagon(two, hexagon.translation.x, hexagon.translation.y, radius);
        for (var i = 0; i<3; i++){
            if (linePaths[i] !== null){
                newHex.drawLineTrack((i+dir+6)%6, (i+3+dir)%6);
            }
        }
        
        for (var i = 0; i<6; i++){
            if (arcPaths[i] !== null){
                newHex.drawArcTrack((i+dir+6)%6, (i+2+dir)%6);
            }
        }
        if (train !== null){
            var e1 = train.getPath().getStartEdge();
            var e2 = train.getPath().getEndEdge();
            e1 = (e1 + 5)%6;
            e2 = (e2 + 5)%6;
            if ((e1 - e2)===3 && e1 > e2){
                var temp = e2;
                e2 = e1;
                e1 = temp;
            }
            var newTracks = newHex.getTracks();
            for (var i = 0; i < newTracks.length; i++) {
                if (newTracks[i].getStartEdge() === e1 && newTracks[i].getEndEdge() === e2){
                    newHex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                    newHex.getTracks()[i]); 
                }
            }
        }

        newHex.echo(this);
        newHex.remove();
        two.update(); 
    }

    var rotateRight = instMethods.rotateRight = function(){
        dir = 1;
        var newHex = new Hexagon(two, hexagon.translation.x, hexagon.translation.y, radius);
        for (var i = 0; i<3; i++){
            if (linePaths[i] !== null){
                newHex.drawLineTrack((i+dir)%6, (i+3+dir)%6);
            }
        }
        
        for (var i = 0; i<6; i++){
            if (arcPaths[i] !== null){
                newHex.drawArcTrack((i+dir)%6, (i+2+dir)%6);
            }
        }
        if (train !== null){
            var e1 = train.getPath().getStartEdge();
            var e2 = train.getPath().getEndEdge();
            e1 = (e1 + 1)%6;
            e2 = (e2 + 1)%6;
            if ((e1 - e2)===3 && e1 > e2){
                var temp = e2;
                e2 = e1;
                e1 = temp;
            }
            var newTracks = newHex.getTracks();
            for (var i = 0; i < newTracks.length; i++) {
                if (newTracks[i].getStartEdge() === e1 && newTracks[i].getEndEdge() === e2){
                    newHex.draw({train: true, 
                        color: train.color, 
                        engine: train.isEngine},0,
                    newHex.getTracks()[i]); 
                }
            }
        }

        newHex.echo(this);
        newHex.remove();
        two.update(); 
    }

    /**
     * Checks if there exists a track (straight or arc) from edge1 to edge2.
     * 
     * @param edge1 - edge index of one of the vertices of the track
     * @param edge2 - edge index of the other vertex of the track
     */
    var doesTrackExist = instMethods.doesTrackExist = function(edge1, edge2) {
        // Check of straight line tracks
        if (Math.abs(edge1 - edge2) === 3) {
            var minEdgeIndex = Math.min(edge1, edge2);
            return linePaths[minEdgeIndex] !== null;
        }
        // Check for arc tracks
        else if (Math.abs(edge1 - edge2) % 2 === 0 && edge1 !== edge2) {
            var arcEdgeIndex = edge1;
            if ((edge1 - edge2 + 6) % 6 === 2) {
                arcEdgeIndex = edge2;
            }
            return arcPaths[arcEdgeIndex] !== null;
        }

        return false;
    };

    var hasTrain = instMethods.hasTrain = function(){
        return train !== null;
    }

    /**
     * Gets a sorted list of adjacent edge indices for those that are connected
     * to a given edge via a track (straight or arc)
     *
     * @param edge - edge index of hexagon
     */
    var adjacentEdges = instMethods.adjacentEdges = function(edge) {
        var adjacentEdgeList = [];

        // check for straight line paths
        var oppositeEdge = (edge + 3) % 6;
        if (doesTrackExist(edge, oppositeEdge)) {
            adjacentEdgeList.push(oppositeEdge);
        }

        // check for arc paths
        var arcEdgeClockwise = (edge + 2) % 6;
        if (doesTrackExist(edge, arcEdgeClockwise)) {
            adjacentEdgeList.push(arcEdgeClockwise);
        }
        var arcEdgeCounter = (edge + 4) % 6;
        if (doesTrackExist(edge, arcEdgeCounter)) {
            adjacentEdgeList.push(arcEdgeCounter);
        }

        return adjacentEdgeList.sort();
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
            drawLineTrack(e1, e2);
        }
        else if (item.id === "menu-item-curved"){
            var e2 = (e1 + 2) % 6;
            drawArcTrack(e1, e2);
        }
        else if (item.id === "menu-item-targets"){
            drawTarget(item.color);
        }
        else if (item.train){
            if (edge !== null && edge !== undefined){
                drawTrain(edge, item.color, item.engine);
            }
        }
    };

    /**
     * Draw a target on the hex if there is at least one track present.
     *
     * @param color - the color of the target, given in a css ready string
     */
    var drawTarget = instMethods.drawTarget = function(color) {
        //target = new Target(two, xCenter. yCenter, radius, color);
        target = two.makePolygon(xCenter, yCenter, radius*.75, 6);
        target.fill = color;
        two.update();
    }

    /**
     * Draw a straight line track on the hexagon from edge1 to edge2, only if it
     * doesn't already exist. Otherwise, nothing will happen.
     *
     * @param edge1 - edge index of one of the vertices of the line
     * @param edge2 - edge index of the other vertex of the line
     */
    var drawLineTrack = instMethods.drawLineTrack = function(edge1, edge2) {
        if (doesTrackExist(edge1, edge2)) {
            return;
        }
        
        if (Math.abs(edge2 - edge1) === 3) {
            var smallerEdge = Math.min(edge1, edge2);
            var largerEdge = Math.max(edge1, edge2);

            var line = drawLine(smallerEdge, largerEdge);
            linePaths[smallerEdge] = Path(two, line, smallerEdge, largerEdge);
            if (train !== null){
                redrawTrain();
            }
        } else {
            console.error("Edges must be opposite from each other; given (" + edge1 + ", " + edge2 + ")");
        }
    };

    /**
     * Draw an arc track on the hexagon from edge1 to edge2, only if it doesn't
     * already exist. Otherwise, nothing will happen.
     *
     * @param edge1 - edge index of one of the vertices of the arc
     * @param edge2 - edge index of the other vertex of the arc
     */
    var drawArcTrack = instMethods.drawArcTrack = function(edge1, edge2) {
        //console.log(edge1+", "+edge2);
        if (doesTrackExist(edge1, edge2)) {
            return;
        }

        if (Math.abs(edge1 - edge2) % 2 === 0 && edge1 !== edge2) {
            var startEdge = edge1;
            var endEdge = edge2;
            if ((edge1 - edge2 + 6) % 6 === 2) {
                startEdge = edge2;
                endEdge = edge1;
            }

            var arc = makeArc(startEdge, endEdge);
            arcPaths[startEdge] = Path(two, arc, startEdge, endEdge);
            if (train !== null){
                redrawTrain();
            }
        } else {
            console.error("Edges must be two edges apart from each other; given (" + edge1 + ", " + edge2 + ")");
        }
    };

    var drawTrain = instMethods.drawTrain = function(edge, color, engine){
        if (train != null){
            removeTrain();
        }
        train = Train(two,edge,color,engine);
        //console.log(arcPaths[e1].getPointAt(0.5));
        //console.log(linePaths[e1].translation);

        //train.edge = e1;
        two.update();
    }

    /**
     * Get the track from edge1 to edge2 if it exists. If it doesn't, 
     * return null
     *
     * @param edge1, edge2 - edges connected to create track
     */
    var getTrack = instMethods.getTrack = function(edge1, edge2) {
        // Check straight line tracks
        if (Math.abs(edge1 - edge2) === 3) {
            var minEdgeIndex = Math.min(edge1, edge2);
            return linePaths[minEdgeIndex];
        }
        // Check arc tracks
        else if (Math.abs(edge1 - edge2) % 2 === 0 && edge1 !== edge2) {
            var arcEdgeIndex = edge1;
            if ((edge1 - edge2 + 6) % 6 === 2) {
                arcEdgeIndex = edge2;
            }
            return arcPaths[arcEdgeIndex];
        }

        return null;
    }

    var getTracks = instMethods.getTracks = function(){
        var tracks = [];
        for (var i = 5; i >= 0; i--){
            if (arcPaths[i] !== null)
                tracks.push(arcPaths[i]);
        }
        for (var i = 2; i >=0; i--){
            if (linePaths[i] !== null)
                tracks.push(linePaths[i]);
        }
        
        return tracks;
    };

    /** 
     * Gets the train, if exists, else null
     */
    var getTrain = instMethods.getTrain = function() {
        return train;
    }

    /**
     * Set train to train object (train.js)
     */
    var setTrain = instMethods.setTrain = function(newTrain) {
        train = newTrain;
    }

    var removePath = instMethods.removePath = function(edge1, edge2) {
        if (edge1 > edge2) {
            return removePath(edge2, edge1);
        }

        if (Math.abs(edge1 - edge2) === 3 && linePaths[edge1] !== null) {
            linePaths[edge1].remove();
            linePaths[edge1] = null;
        } else {
            //console.log('Unable to remove line from edge ' + edge1 + ' to ' + edge2);
        }
    };
    
    var removeArc = instMethods.removeArc = function(edge1) {
        if (arcPaths[edge1] !== null) {
            arcPaths[edge1].remove();
            arcPaths[edge1] = null;
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
        two.remove(hexagon);
        two.remove(target);
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
        return {x: hexagon.translation.x, y: hexagon.translation.y};
    };

    var getPositionIndex = instMethods.getPositionIndex = function() {
        return {xIndex: xIndex, yIndex: yIndex}
    };

    var setFill = instMethods.setFill = function(fill){
        hexagon.fill = fill;
        two.update();
    };

    //====== Private Methods ==============

    var rotate = function(dir){
       
    };

    var drawLine = function(edge1, edge2) {
        var edgeCenter1 = getSideCoord(edge1);
        var edgeCenter2 = getSideCoord(edge2);

        var line = two.makePath(edgeCenter1.x, edgeCenter1.y, edgeCenter2.x, edgeCenter2.y, true);
        two.update();

        return line;
    }

    var redrawTrain = function() {
        newTrain = Train(two, train.getPath(), train.color, train.isEngine);
        removeTrain();
        train = newTrain;
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
            .75*(hexagon.translation.x - edgeCenter1.x), .75*(hexagon.translation.y - edgeCenter1.y), Two.Commands.curve);
        var anchor2 = new Two.Anchor(edgeCenter2.x, edgeCenter2.y, 
            (hexagon.translation.x - edgeCenter2.x)*.75, .75*(hexagon.translation.y - edgeCenter2.y), 0, 0, Two.Commands.curve);

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
            x: hexagon.translation.x + dx,
            y: hexagon.translation.y + dy,
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