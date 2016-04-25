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
     * TODO: implement direction of train
     */
    var shortestPath = instMethods.shortestPath = function(startHexagon, endHexagon) {
        //Initialize priority queue
        var priorityQueue = PriorityQueue();

        //Put first hexagon node (after the startHexagon) into priority queue
        //TODO: make head of engine an input
        var startHexNode = HexNode(startHexagon, 2, 1, heuristic(startHexagon, endHexagon))
        var nextHexagon = getAdjacentHexagons(startHexagon)[5]
        var nextHexNode = HexNode(nextHexagon, 2, 1, 1 + heuristic(nextHexagon, endHexagon), startHexNode);
        priorityQueue.add(nextHexNode);

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

    // Private Methods

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
                    new_dx = dx + (dx + 1)*2;
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