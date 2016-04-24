var GameBoardUtil = {}

/**
 * Gets the coordinates to the center of the hexagon, relative to the 
 * canvas. 
 *
 * @param xIndex - horizontal index of the hexagon, starting on the left at 0
 * @param yIndex - vertical index of the hexagon, starting on the top at 0
 * @param radius - the radius of the hexagons
 */
GameBoardUtil.getHexCenter = function(xIndex, yIndex, radius) {
    var horizontalDistance = radius * Math.sqrt(3)/2.0

    return {
        x: 2*xIndex*horizontalDistance + (yIndex % 2) * horizontalDistance,
        y: 1.5*yIndex*radius
    }
}

/**
 * Gets the board size dimensions in pixels
 *
 * @param numHorizontal - number of hexagons horizontally
 * @param numVertical - number of hexagons vertically
 * @param radius - radius of hexagons
 */
GameBoardUtil.getBoardSize = function(numHorizontal, numVertical, radius) {
    return {
        width: (radius*Math.sqrt(3))*(numHorizontal - 0.5),
        height: 1.5*radius*(numVertical - 1)
    }
}