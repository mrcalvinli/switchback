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
        addTrainsOnBoard(gameboardJSON['trains'])
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

        return hexagon;
    }

    /**
     * Adds trains onto the gameboard
     *
     * @param trainJSON - JSON of train list extracted from gameboard
     */
    var addTrainsOnBoard = function(trainsJSON) {
        for (var i = 0; i < trainsJSON.length; i++) {
            var trainJSON = trainsJSON[i];
            var hexLoc = '(' + trainJSON.hexagonCoord.x + ',' + trainJSON.hexagonCoord.y + ')';
            var hexagon = hexagonLocMap[hexLoc];
            var track = hexagon.getTrack(trainJSON.edges.start, trainJSON.edges.end);

            hexagon.drawTrain(track, trainJSON.color, trainJSON.engine, trainJSON.isForward);

            //TODO join trains together that should be coupled
        }
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
            if (two.playing) {
                console.log('Clicks are useless, train is moving');
                return;
            }

            var clickedId = $(this).attr('id');

            // Check if startHexagon is been selected yet
            if (startHexId === null) {
                var hexagon = hexagonIdMap[clickedId];
                if (hexagon.getTrain() !== null && hexagon.getTrain().isEngine) {
                    startHexId = clickedId;
                    hexagonIdMap[startHexId].clickedMode(true);
                }
            } 
            // Check if it's deselecting the startHexagon
            else if (clickedId === startHexId) {
                hexagonIdMap[startHexId].clickedMode(false);
                startHexId = null;
            }
            // Perform pathfinding since it's a different hexagon
            else {
                var startHex = hexagonIdMap[startHexId];
                var endHex = hexagonIdMap[clickedId];

                startHex.clickedMode(false);

                if (startHex.getTrain() !== null) {
                    var trainMoved = moveTrain(startHex, endHex);
                }

                if (trainMoved) {
                    startHexId = clickedId;
                } else {
                    startHexId = null;
                }
            }
        });
    }

    /** 
     * Moves engine train to destination. Returns true if train can move
     * to said destination, false otherwise.
     *
     * @param engineHex - hexagon with the train engine to move
     * @param endHex - hexagon destination of the train engine 
     * @return boolean - true if train will move, false otherwise
     */
    var moveTrain = function(engineHex, endHex) {
        var params = {
            RADIUS: RADIUS,
            NUM_HORIZONTAL_HEX: NUM_HORIZONTAL_HEX,
            NUM_VERTICAL_HEX: NUM_VERTICAL_HEX
        };
        var pathfinding = PathFinding(hexagonLocMap, params);

        // Get front and back trains train
        var engineTrain = engineHex.getTrain();
        var engineTrack = engineTrain.getPath();
        var frontTrainInfo = pathfinding.getEndTrainInfo(engineHex, engineTrack.getStartEdge());
        var backTrainInfo = pathfinding.getEndTrainInfo(engineHex, engineTrack.getEndEdge());

        // Get best path for trains
        var trainsInfo = [frontTrainInfo, backTrainInfo];
        var bestTrainPath;
        var bestTrainInfo;
        for (var i = 0; i < trainsInfo.length; i++) {
            var trainInfo = trainsInfo[i];
            var trainHex = trainInfo.hexagon;
            var trainTrack = trainHex.getTrain().getPath();
            var nextEdge = trainInfo.outEdge;

            var trainPath = pathfinding.shortestPath(trainHex, endHex, trainTrack, nextEdge);
            if (trainPath !== undefined && (bestTrainPath === undefined || trainPath.length < bestTrainPath.length)) {
                bestTrainPath = trainPath;
                bestTrainInfo = trainInfo;
            }
        }
        
        if (bestTrainPath !== undefined) {
            // Get train path, from one end to the next
            var trainHex = bestTrainInfo.hexagon;
            var frontEdge = bestTrainInfo.outEdge;
            var trainPathNodes = pathfinding.getTrainPath(trainHex, frontEdge);

            // for (var i = 0; i < trainPathNodes.length; i++) {
            //     console.log(i + ": " + trainPathNodes[i].getHexId());
            // }
            // return true;

            // Move train
            moveTrainsOnPath(engineHex, bestTrainPath, trainPathNodes);
            return true;
        }

        return false;
    }

    // Constants for animating trains
    // Used for adjusting speed of animations
    var MIDDLE_T_PARAM = 0.5;
    var MIN_T_PARAM = 0.01;
    var MAX_T_PARAM = 0.99;
    var INCREMENT_STEP = 0.01;

    /**
     * Move trains along path
     *
     * @param engineHex - Hexagon object with the engine train on it
     * @param pathNodes - list of PathNodes starting from front car to destination
     * @param trainPathNodes - list of PathNodes starting from front car to end car, all
     *                          containing trains
     */
    var moveTrainsOnPath = function(engineHex, pathNodes, trainPathNodes) {
        // Holds all of the animation parameters for each train
        var trainAnimationInfoList = [];
        for (var i = 0; i < trainPathNodes.length; i++) {
            var animationInfo = {};
            var trainHexId = trainPathNodes[i].getHexId();
            var trainHex = hexagonIdMap[trainHexId];
            var pathDirection = getPathDirection(trainPathNodes[i])

            animationInfo.tParam = MIDDLE_T_PARAM;
            animationInfo.pathIndex = -1*i;
            animationInfo.bound = pathDirection ? MAX_T_PARAM : MIN_T_PARAM;
            animationInfo.trainObj = trainHex.getTrain();
            animationInfo.dirFactor = pathDirection ? 1 : -1;
            animationInfo.trainDir = pathDirection === trainHex.getTrain().isFacingForward();

            //remove train reference from hexagon
            trainHex.removeTrainRef();

            // add to list
            trainAnimationInfoList.push(animationInfo);
        }

        // Get the tracks to travel on for all trains
        var travelPathTracks = getTracksForPath(pathNodes);
        var trainPathTracks = getTracksForPath(trainPathNodes);

        var animateTrains = function() {
            //will be set at the last animation step
            var endEngineHex;

            // Loop through all trains to animate
            for (var i = 0; i < trainAnimationInfoList.length; i++) {
                // Get animation parameters
                var animationInfo = trainAnimationInfoList[i];
                var dirFactor = animationInfo.dirFactor;
                var tParam = animationInfo.tParam;
                var bound = animationInfo.bound;
                var pathIndex = animationInfo.pathIndex;

                // Increment train along track
                if (dirFactor * (tParam - bound) < 0) {
                    animationInfo.tParam += dirFactor*INCREMENT_STEP;
                } 
                // Switch train to new track
                else if (dirFactor * (tParam - bound) >= 0 && (i + pathIndex) < travelPathTracks.length - 1) {
                    // Update onto new track
                    animationInfo.pathIndex++;

                    // Set direction of train
                    var pathDirection;
                    if (animationInfo.pathIndex >= 0) {
                        pathDirection = getPathDirection(pathNodes[animationInfo.pathIndex]);
                    } else {
                        pathDirection = getPathDirection(trainPathNodes[-1*animationInfo.pathIndex]);
                    }
                    animationInfo.dirFactor = pathDirection ? 1 : -1;
                    animationInfo.trainObj.setFacingDirection(animationInfo.trainDir ? pathDirection : !pathDirection);
                    
                    // Reset where on the curve the train is
                    animationInfo.tParam = pathDirection ? MIN_T_PARAM : MAX_T_PARAM;
                    animationInfo.bound = pathDirection ? MAX_T_PARAM : MIN_T_PARAM;
                    if ((i + animationInfo.pathIndex) === travelPathTracks.length - 1) {
                        animationInfo.bound = MIDDLE_T_PARAM;
                    }
                }
                // End animation
                else {
                    // Stop the animation once on first train(and not for every train)
                    if (i === 0) {
                        two.pause();
                        two.unbind('update', animateTrains);
                    }

                    //reset train to new location
                    var endHexId;
                    var endTrack;
                    if (animationInfo.pathIndex >= 0) {
                        endHexId = pathNodes[animationInfo.pathIndex].getHexId();
                        endTrack = travelPathTracks[animationInfo.pathIndex];
                    } else {
                        endHexId = trainPathNodes[-1*animationInfo.pathIndex].getHexId();
                        endTrack = trainPathTracks[-1*animationInfo.pathIndex];
                    }
                    var endHex = hexagonIdMap[endHexId];
                    var trainObj = animationInfo.trainObj;
                    endHex.drawTrain(endTrack, trainObj.color, trainObj.isEngine, trainObj.isFacingForward());

                    //Remove old train
                    trainObj.remove();

                    // Check if it's an engine
                    if (endHex.getTrain().isEngine) {
                        endEngineHex = endHex;
                    }
                }

                // Get the track to animate train on
                var track; 
                if (animationInfo.pathIndex >= 0) {
                    track = travelPathTracks[animationInfo.pathIndex];
                } else {
                    track = trainPathTracks[-1*animationInfo.pathIndex];
                }

                // Move train on track
                var trainObj = animationInfo.trainObj;
                var trainTwoObj = trainObj.train;
                track.translateOnCurve(animationInfo.tParam, trainTwoObj, trainObj.isFacingForward());
            }

            // Reselect the engine train at the very end
            if (!two.playing) {
                if (startHexId !== null && startHexId !== endEngineHex.getId()) {
                    hexagonIdMap[startHexId].clickedMode(false);
                }
                startHexId = endEngineHex.getId();
                endEngineHex.clickedMode(true);
            }
        };

        two.bind('update', animateTrains).play();
    }

    /**
     * Returns the direction (positive or negative) along the path from 
     * start edge to end edge. If positive, return true, else return false;
     *
     * @param pathNode - PathNode object
     */
    var getPathDirection = function(pathNode) {
        var startEdge = pathNode.getStartEdge();
        var endEdge = pathNode.getEndEdge();

        if (Math.abs(startEdge - endEdge) === 3) {
            return startEdge < endEdge;
        } else if (Math.abs(startEdge - endEdge) % 2 === 0 && startEdge != endEdge) {
            return ((startEdge + 2) % 6) === endEdge;
        }
    }

    /**
     * Given a list of pathNodes, get all the tracks to traverse on
     *
     * @param pathNodesList - list of PathNodes for path
     */
    var getTracksForPath = function(pathNodesList) {
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