var PathFinding = function(hexagonMap, params) {

    var RADIUS = params.RADIUS;
    var NUM_HORIZONTAL_HEX = params.NUM_HORIZONTAL_HEX;
    var NUM_VERTICAL_HEX = params.NUM_VERTICAL_HEX;

    /**
     * Node of a hexagon for priority heap
     */
    var HeapNode = function(hexagon, startEdge, steps, estimatedDistance, parentNode) {

        /**
         * Return hexagon of the node
         */
        var getHexagon = function() {
            return hexagon;
        }

        /**
         * Get starting edge in hexagon to do path-finding (i.e. from
         * from starting edge to adjacent edge, connected by a path)
         */
        var getStartEdge = function() {
            return startEdge;
        }

        /**
         * Get number of hexagons (or equivalent paths) taken from 
         * starting hexagon
         */
        var getSteps = function() {
            return steps;
        }

        /**
         * Get shortest estimated distance from starting hexagon to end hexagon
         * going through this hexagon 
         */
        var getEstDist = function() {
            return estimatedDistance;
        }

        /**
         * Gets the parent node
         */
        var getParentNode = function() {
            return parentNode;
        }

        return {
            getHexagon: getHexagon,
            getStartEdge: getStartEdge,
            getSteps: getSteps,
            getEstDist: getEstDist,
            getParentNode: getParentNode
        }
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
    
    // Public Methods

    var shortestPath = function(startHexagon, endHexagon) {
        //Initialize priority queue
        var priorityQueue = PriorityQueue();

        //Put first hexagon node (after the startHexagon) into priority queue
        //TODO: make head of engine an input
        var startHexNode = HeapNode(startHexagon, 0, 1, heuristic(startHexagon, endHexagon))
        var nextHexagon = getAdjacentHexagons(startHexagon)[6]
        var nextHexNode = HeapNode(nextHexagon, 3, 1, 1 + heuristic(nextHexagon, endHexagon), startHexNode);
        priorityQueue.add(nextHexNode);

        while (priorityQueue.size() > 0) {
            var node = priorityQueue.pop();
            var hexagon = node.getHexagon();
            var startEdge = node.getStartEdge();
            var steps = node.getSteps();

            //end condition
            if (hexagon.getId() === endHexagon.getId()) {
                return;
                var currNode = node;
                var hexIdPath = []
                while (currNode !== undefined) {
                    hexIdPath.push(currNode.getHexagon().getId());
                    currNode = currNode.getParentNode();
                }
                return hexIdPath.reverse();
            }

            //get children
            var adjacentEdges = hexagon.adjacentEdges(startEdge);
            var adjacentHexs = getAdjacentHexagons(hexagon);
            for (var i = 0; i < adjacentEdges.length; i++) {
                var adjacentEdge = adjacentEdges[i];
                var adjacentHex = adjacentHexs[adjacentEdge]
                var nextEdge = (adjacentEdge + 2) % 6 + 1;
                var newSteps = steps + 1;
                var newEstDist = newSteps + heuristic(adjacentHex, endHexagon);

                //add children into heap
                var childNode = HeapNode(adjacentHex, nextEdge, newSteps, newEstDist, node);
                priorityQueue.add(childNode);
            }

        }
    }

    // Private Methods
    var heuristic = function(hexagon1, hexagon2) {
        var position1 = hexagon1.getPosition();
        var position2 = hexagon2.getPosition();

        var distance = Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
        return distance/RADIUS;
    }

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
                    var newHexagonId = hexagonId + new_dx + dy * NUM_HORIZONTAL_HEX;
                    adjacentHexagonList.push(hexagonMap["two_" + newHexagonId]);
                } else {
                    adjacentHexagonList.push(null);
                }
            }
        }

        return {
            1: adjacentHexagonList[0] !== null ? adjacentHexagonList[0] : undefined,
            2: adjacentHexagonList[1] !== null ? adjacentHexagonList[1] : undefined,
            3: adjacentHexagonList[3] !== null ? adjacentHexagonList[3] : undefined,
            4: adjacentHexagonList[5] !== null ? adjacentHexagonList[5] : undefined,
            5: adjacentHexagonList[4] !== null ? adjacentHexagonList[4] : undefined,
            6: adjacentHexagonList[2] !== null ? adjacentHexagonList[2] : undefined
        }
    }

    //====== Initialization ===============
    var init = (function() {

    })();

    return {
        shortestPath: shortestPath
    };
}