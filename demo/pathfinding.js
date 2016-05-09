/**
 * Object for finding paths from one hexagon to another. 
 * 
 * @param hexagonLocMap - maps location index (e.g '(x,y)') to a hexagon object in grid
 * @param params - an object of parameters for the RADIUS, NUM HORIZONTAL
 *                  HEXAGON, NUM VERTICAL HEXAGON
 */
var PathFinding = function(hexagonLocMap, params) {

    var RADIUS = params.RADIUS;
    var NUM_HORIZONTAL_HEX = params.NUM_HORIZONTAL_HEX;
    var NUM_VERTICAL_HEX = params.NUM_VERTICAL_HEX;

    /**
     * Node of a hexagon for priority queue
     * 
     * @param hexagon - hexagon object of node
     * @param startEdge - starting edge for train to traverse from
     * @param steps - number of steps taken to get to this hexagon
     * @param estimatedDistance - estimated shortest distance from start hexagon to
     *                              end hexagon, using heuristic function below
     * @param parentNode - parent of this node
     */
    var HexNode = function(hexagon, startEdge, steps, estimatedDistance, parentNode) {

        var instMethods = {};

        /**
         * Return hexagon of the node
         */
        var getHexagon = instMethods.getHexagon = function() {
            return hexagon;
        }

        /**
         * Get starting edge in hexagon to do path-finding (i.e. from
         * from starting edge to adjacent edge, connected by a path)
         */
        var getStartEdge = instMethods.getStartEdge = function() {
            return startEdge;
        }

        /**
         * Get number of hexagons (or equivalent paths) taken from 
         * starting hexagon
         */
        var getSteps = instMethods.getSteps = function() {
            return steps;
        }

        /**
         * Get shortest estimated distance from starting hexagon to end hexagon
         * going through this hexagon 
         */
        var getEstDist = instMethods.getEstDist = function() {
            return estimatedDistance;
        }

        /**
         * Gets the parent node
         */
        var getParentNode = instMethods.getParentNode = function() {
            return parentNode;
        }

        return instMethods;
    }

    /**
     * Priority queue for heuristic-based search.
     */
    var PriorityQueue = function() {
        /**
         * === Min-Heap ===
         * Rep invariant of heap: the children of any node will have 
         * estimatedDistance values equal/greater than the estimatedDistance
         * of the node.
         */
        var heap = []

        // Instance Methods

        /**
         * Get the number of elements in queue
         */
        var size = function() {
            return heap.length;
        }

        /**
         * Add hexagon-edge node into heap.
         */
        var add = function(hexNode) {
            heap.push(hexNode);

            //fix heap to have correct rep invariant
            var addedElementIndex = heap.length - 1;
            var parentIndex = Math.floor((addedElementIndex - 1) / 2);
            while (addedElementIndex > 0 && heap[parentIndex].getEstDist() > heap[addedElementIndex].getEstDist()) {
                swap(addedElementIndex, parentIndex);
                addedElementIndex = parentIndex;
                parentIndex = Math.floor((addedElementIndex - 1) / 2);
            }
        }

        /**
         * Pop hexagon-edge node with current estimated shortest distance to endgoal
         */
        var pop = function() {
            if (heap.length === 0) {
                return;
            }

            //get top element in heap
            swap(0, heap.length - 1);
            var popElement = heap.pop();

            //fix heap
            var fixElementIndex = 0;
            var leftIndex = 1;
            var rightIndex = 2;
            while (leftIndex < heap.length) {
                var nodeVal = heap[fixElementIndex].getEstDist();
                var leftChildVal = heap[leftIndex].getEstDist();
                var rightChildVal = (rightIndex < heap.length) ? heap[rightIndex].getEstDist() : Number.MAX_SAFE_INTEGER;

                var minVal = Math.min(nodeVal, leftChildVal, rightChildVal)
                if (minVal === nodeVal) {
                    break;
                } else if (minVal === leftChildVal) {
                    swap(fixElementIndex, leftIndex);
                    fixElementIndex = leftIndex;
                } else {
                    swap(fixElementIndex, rightIndex);
                    fixElementIndex = rightIndex;
                }

                //fix child indices
                leftIndex = 2 * fixElementIndex + 1;
                rightIndex = 2 * fixElementIndex + 2;
            }

            return popElement;
        }

        // Private Methods

        var swap = function(i, j) {
            var temp = heap[i];
            heap[i] = heap[j]
            heap[j] = temp;
        }

        // Initialization

        return {
            size: size,
            add: add,
            pop: pop
        }
    }
    
    //====== Public Methods ===================

    var instMethods = {};

    /**
     * Find shortest path from one hexagon to another
     * 
     * @param startHexagon - starting hexagon
     * @param endHexagon - ending hexagon
     * @param startTrack - track (path.js) that train is initially on
     * @param nextEdge - edge index, referring to edge to look for next adjacent hexagon
     */
    var shortestPath = instMethods.shortestPath = function(startHexagon, endHexagon, startTrack, nextEdge) {
        //Initialize priority queue
        var priorityQueue = PriorityQueue();

        // Get correct start and end edges of start track
        var startEdge;
        var endEdge = nextEdge;
        if (nextEdge === startTrack.getStartEdge()) {
            startEdge = startTrack.getEndEdge();
        } else {
            startEdge = startTrack.getStartEdge();
        }

        //Put first forward hexagon node (after the startHexagon) into priority queue
        var startHexNode = HexNode(startHexagon, startEdge, 1, heuristic(startHexagon, endHexagon))
        var nextHexagon = getAdjacentHexagons(startHexagon)[endEdge]
        if (nextHexagon !== undefined) {
            var nextHexNode = HexNode(nextHexagon, (endEdge + 3) % 6, 1, 1 + heuristic(nextHexagon, endHexagon), startHexNode);
            priorityQueue.add(nextHexNode);
        }

        // Find shortest path
        while (priorityQueue.size() > 0) {
            var node = priorityQueue.pop();
            var hexagon = node.getHexagon();
            var startEdge = node.getStartEdge();
            var steps = node.getSteps();

            //end condition
            var adjacentEdges = hexagon.adjacentEdges(startEdge);
            if (hexagon.getId() === endHexagon.getId() && adjacentEdges.length > 0) {
                var endEdge = adjacentEdges[0];
                var currNode = node;
                var hexIdPath = []
                while (currNode !== undefined) {
                    //push node into list
                    var hexagonId = currNode.getHexagon().getId();
                    var startEdge = currNode.getStartEdge();
                    hexIdPath.push(PathNode(hexagonId, startEdge, endEdge));

                    //adjust variables
                    endEdge = (currNode.getStartEdge() + 3) % 6;
                    currNode = currNode.getParentNode();
                }
                return hexIdPath.reverse();
            }

            //get children
            var adjacentHexs = getAdjacentHexagons(hexagon);
            for (var i = 0; i < adjacentEdges.length; i++) {
                var adjacentEdge = adjacentEdges[i];
                var adjacentHex = adjacentHexs[adjacentEdge]
                if (adjacentHex !== undefined) {
                    var nextEdge = (adjacentEdge + 3) % 6;
                    var newSteps = steps + 1;
                    var newEstDist = newSteps + heuristic(adjacentHex, endHexagon);

                    //add children into heap
                    var childNode = HexNode(adjacentHex, nextEdge, newSteps, newEstDist, node);
                    priorityQueue.add(childNode);
                }
            }
        }
    }

    /**
     * Finds the end car of the connected trains going through a given edge
     * of the hexagon (must be one of the edges of the track that the train
     * is on). 
     *
     * If there are no connected trains in that direction, then it will return
     * the current hexagon, otherwise, it will return the hexagon with the
     * end car.
     *
     * @param engineHex - hexagon with engine train on it
     * @param adjacentHexEdge - the edge of the train track to continue looking for more 
     * @return Object {
     *              "hexagon": Hexagon - hexagon object containing end car
     *              "outEdge": int - edge index referring to the edge of the end car hexagon where
     *                                  the adjacent hex doesn't have another train
     */
    var getEndTrainInfo = instMethods.getEndTrainInfo = function(engineHex, adjacentHexEdge) {
        var currentHex = engineHex;
        var nextEdge = adjacentHexEdge;
        var nextHex = getAdjacentHexagons(currentHex)[nextEdge];
        while (nextHex !== undefined && nextHex.getTrain() !== null) {
            //TODO edit condition above to account for coupled trains

            // Update current hexagon
            currentHex = nextHex;

            // Update next adjacent edge
            var currTrainTrack = currentHex.getTrain().getPath();
            var newEdge = currTrainTrack.getStartEdge();
            if (nextEdge === (newEdge + 3) % 6) {
                nextEdge = currTrainTrack.getEndEdge();
            } else {
                nextEdge = newEdge;
            }

            // Update next hexagon
            nextHex = getAdjacentHexagons(currentHex)[nextEdge];
        }

        return {
            "hexagon": currentHex,
            "outEdge": nextEdge
        };
    }

    /**
     * Gets a list of PathNode objects representing the path from the front train
     * to the back train
     *
     * @param trainHex - Hexagon object containing the front train
     * @param frontEdge - edge index of the front of the train
     */
    var getTrainPath = instMethods.getTrainPath = function(trainHex, frontEdge) {
        var trainPathList = [];
        var currHex = trainHex;
        var endEdge = frontEdge;
        while (currHex !== undefined && currHex.getTrain() !== null) {
            var currTrack = currHex.getTrain().getPath();
            var startEdge = (endEdge === currTrack.getStartEdge()) ? currTrack.getEndEdge() : currTrack.getStartEdge();

            var trainNode = PathNode(currHex.getId(), startEdge, endEdge);
            trainPathList.push(trainNode);

            // Update to next hexagon
            currHex = getAdjacentHexagons(currHex)[startEdge];
            endEdge = (startEdge + 3) % 6;
        }

        return trainPathList;
    }

    //====== Private Methods =======================

    /**
     * Provides heuristic for distance from one hexagon to another. It is
     * an underestimate of number of hexagons required to get 
     *
     * @param hexagon1, hexagon2 - hexagons to find distance between
     */
    var heuristic = function(hexagon1, hexagon2) {
        var position1 = hexagon1.getPosition();
        var position2 = hexagon2.getPosition();

        var distance = Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
        return distance/RADIUS;
    }

    /**
     * Return the adjacent hexagons in the gameboard
     *
     * @param hexagon - hexagon to get adjacent ones for
     */
    var getAdjacentHexagons = function(hexagon) {
        var adjacentHexagonList = []

        var positionIndex = hexagon.getPositionIndex();
        var hexagonId = Number(hexagon.getId().substring(4));

        // adjustment for xIndex depending on which row hexagon is in
        var xAdjuster = 0;
        if (positionIndex.yIndex % 2 !== 0) {
            xAdjuster = 1;
        }

        // go through each row to get the adjacent squares
        for (var dy = -1; dy < 2; dy++) {
            for (var dx = -1; dx < 1; dx++) {
                var new_dx;
                if (dy === 0) {
                    new_dx = dx + (dx + 1);
                } else {
                    new_dx = dx + xAdjuster;
                }

                var x_new = positionIndex.xIndex + new_dx;
                var y_new = positionIndex.yIndex + dy;

                if (x_new >= 0 && x_new < NUM_HORIZONTAL_HEX && y_new >= 0 && y_new < NUM_VERTICAL_HEX) {
                    var newHexLoc = '(' + x_new + ',' + y_new + ')';
                    adjacentHexagonList.push(hexagonLocMap[newHexLoc]);
                } else {
                    adjacentHexagonList.push(null);
                }
            }
        }

        return {
            0: adjacentHexagonList[0] !== null ? adjacentHexagonList[0] : undefined,
            1: adjacentHexagonList[1] !== null ? adjacentHexagonList[1] : undefined,
            2: adjacentHexagonList[3] !== null ? adjacentHexagonList[3] : undefined,
            3: adjacentHexagonList[5] !== null ? adjacentHexagonList[5] : undefined,
            4: adjacentHexagonList[4] !== null ? adjacentHexagonList[4] : undefined,
            5: adjacentHexagonList[2] !== null ? adjacentHexagonList[2] : undefined
        }
    }

    //====== Initialization ===============
    var init = (function() {

    })();

    return instMethods;
}

/**
 * A representation of the path a train takes on a hexagon, from start 
 * edge to end edge.
 *
 * @param hexId - hexagon ID for train to go on
 * @param startEdge - edge index of start point of path
 * @param endEdge - edge index of end point of path 
 */
var PathNode = function(hexId, startEdge, endEdge) {

    var instMethods = {};

    var getHexId = instMethods.getHexId = function() {
        return hexId;
    }

    var getStartEdge = instMethods.getStartEdge = function() {
        return startEdge;
    }

    var getEndEdge = instMethods.getEndEdge = function() {
        return endEdge;
    }

    return instMethods;
}