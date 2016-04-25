/**
 * Gameboard representing a switchback game
 */
var GameBoard = function(two, gameboardJSON) {

    //Instance Variables
    var RADIUS;
    var NUM_HORIZONTAL_HEX;
    var NUM_VERTICAL_HEX;

    /**
     * Map of hexagon ID to hexagon object
     */
    var hexagonIdMap = {};

    /**
     * Map of x,y index (in string form) to hexagon object
     * (e.g. map['(x,y)'] = hexagon)
     */
    var hexagonLocMap = {};

    /**
     * Holds which hexagon is clicked on for pathfinding
     */
    var startHexId = null;
    var endHexId = null;

    //====== Public Methods ===================

    var instMethods = {};

    //====== Private Methods ==================

    /**
     * Extract the gameboard information from the gameboard JSON
     */
    var extractGameboard = function() {
        RADIUS = gameboardJSON['hexRadius'];
        NUM_HORIZONTAL_HEX = gameboardJSON['numHorizontal'];
        NUM_VERTICAL_HEX = gameboardJSON['numVertical'];

        createHexagonsOnBoard(gameboardJSON['hexagons']);
    };

    /**
     * Create hexagons on the board from the 2D list of hexagons in JSON
     *
     * @param hexagonsJSON - JSON of 2D list of hexagons of board
     */
    var createHexagonsOnBoard = function(hexagonsJSON) {
        for (var i = 0; i < NUM_VERTICAL_HEX; i++) {
            for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
                // Create hexagon
                var hexJSON = hexagonsJSON[i][j];
                var hexagon = createHexagon(hexJSON, j, i);

                // Add to maps
                hexagonIdMap[hexagon.getId()] = hexagon;
                hexagonLocMap['(' + j + ',' + i + ')'] = hexagon;
            }
        }
    }

    /**
     * Create hexagon from hexagon JSON object
     *
     * @param hexJSON - JSON of hexagon extracted from the gameboard JSON
     * @param xIndex - horizontal index of the hexagon, starting on the left at 0
     * @param yIndex - vertical index of the hexagon, starting on the top at 0
     */
    var createHexagon = function(hexJSON, xIndex, yIndex) {
        // Create hexagon
        var hexCenter = GameBoardUtil.getHexCenter(xIndex, yIndex, RADIUS);
        var hexagon = Hexagon(two, hexCenter.x, hexCenter.y, RADIUS, xIndex, yIndex);

        // Add event handlers to hexagon
        addHexagonEventHandlers(hexagon);

        if (hexJSON === null) {
            return hexagon;
        }

        // Add the straight line tracks
        var lineTracks = hexJSON.lineTracks;
        for (var i = 0; i < lineTracks.length; i++) {
            var startEdge = lineTracks[i];
            var endEdge = (startEdge + 3) % 6;

            hexagon.drawLineTrack(startEdge, endEdge);
        }

        // Add the arc tracks
        var arcTracks = hexJSON.arcTracks;
        for (var i = 0; i < arcTracks.length; i++) {
            var startEdge = arcTracks[i];
            var endEdge = (startEdge + 2) % 6;

            hexagon.drawArcTrack(startEdge, endEdge);
        }

        // TODO: add train logic!
        if (hexJSON.train === true) {
            var track = hexagon.getTracks()[0];
            hexagon.drawTrain(track, 'gold', true);
        }

        return hexagon;
    }

    /**
     * Adding event handlers to hexagon
     *
     * @param hexagon
     */
    var addHexagonEventHandlers = function(hexagon) {
        var hexagonDOM = $('#' + hexagon.getId());
        
        hexagonDOM.hover(function() {
            hexagon.hoverMode(true);
        }, function() {
            hexagon.hoverMode(false);
        });

        hexagonDOM.on('click', function() {
            var id = $(this).attr('id');

            // Check if startHexagon is been selected yet
            if (startHexId === null) {
                startHexId = id;
                hexagonIdMap[startHexId].clickedMode(true);
            } 
            // Check if it's deselecting the startHexagon
            else if (id === startHexId) {
                hexagonIdMap[startHexId].clickedMode(false);
                startHexId = null;
            }
            // Perform pathfinding since it's a different hexagon
            else {
                endHexId = id;

                var startHex = hexagonIdMap[startHexId];
                var endHex = hexagonIdMap[endHexId];

                var params = {
                    RADIUS: RADIUS,
                    NUM_HORIZONTAL_HEX: NUM_HORIZONTAL_HEX,
                    NUM_VERTICAL_HEX: NUM_VERTICAL_HEX
                };
                var pathfinding = PathFinding(hexagonLocMap, params);

                var shortestPathNodes = pathfinding.shortestPath(startHex, endHex);

                // Deselect start hex
                hexagonIdMap[startHexId].clickedMode(false);

                // Set all back to null
                startHexId = null;
                endHexId = null;

                //TODO MOVE TRAIN
                moveTrainsOnPath(shortestPathNodes, startHex);
            }
        });
    }

    /**
     * Move trains along path
     */
    var moveTrainsOnPath = function(pathNodes, startHex) {
        // Get tracks for train to travel on
        // TOOD: change for multiple trains
        var listTracks = getTracksForTrain(pathNodes);

        var t = 0.5;
        var i = 0;
        var train = startHex.getTrain().train;
        var track = listTracks[i];
        var pathDirection = getPathDirection(pathNodes[i]);
        var bound = pathDirection === 1 ? 0.99 : 0.01
        two.bind('update', function() {
            if (pathDirection * (t - bound) < 0) {
                t += pathDirection*0.01;
            } else if (pathDirection * (t - bound) >= 0 && i < listTracks.length - 1) {
                // Set new track
                i++;
                track = listTracks[i];

                // Reset where on the curve on for train to be
                pathDirection = getPathDirection(pathNodes[i]);
                t = (pathDirection === 1) ? 0.01 : 0.99;
                bound = (pathDirection === 1) ? 0.99 : 0.01;
            } else {
                two.pause();
            }

            track.translateOnCurve(t, train);
        }).play();
    }

    /**
     * Returns the direction (positive or negative) along the path from 
     * start edge to end edge. If positive, return 1, else return -1;
     *
     * @param pathNode - PathNode object
     */
    var getPathDirection = function(pathNode) {
        var startEdge = pathNode.getStartEdge();
        var endEdge = pathNode.getEndEdge();

        if (Math.abs(startEdge - endEdge) === 3) {
            return startEdge < endEdge ? 1 : -1;
        } else if (Math.abs(startEdge - endEdge) % 2 === 0 && startEdge != endEdge) {
            return ((startEdge + 2) % 6) === endEdge ? 1 : -1;
        }
    }

    /**
     * Given a list of pathNodes, get all the tracks for the train to
     * traverse on
     *
     * @param pathNodesList - list of PathNodes for train's path
     */
    var getTracksForTrain = function(pathNodesList) {
        var listTracks = [];

        for (var i = 0; i < pathNodesList.length; i++) {
            var pathNode = pathNodesList[i];
            var hexagon = hexagonIdMap[pathNode.getHexId()];
            var track = hexagon.getTrack(pathNode.getStartEdge(), pathNode.getEndEdge());
            listTracks.push(track);
        }

        return listTracks;
    }

    //====== Initialization ===================
    var init = (function() {
        extractGameboard();
    })();

    return instMethods;
};