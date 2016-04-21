/**
 * Gameboard representing a switchback game
 */
var GameBoard = function(two, gameboardJSON) {

    //Instance Variables
    var RADIUS;
    var NUM_HORIZONTAL_HEX;
    var NUM_VERTICAL_HEX;

    /**
     * 2D array of board, a list of lists of hexagons, where the inner list refers
     * to the hexagons (in order) in the row.
     */
    var hexagons = [];

    //====== Public Methods ===================

    var instMethods = {}

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
            var hexagonRow = [];
            for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
                // Create hexagon
                var hexJSON = hexagonsJSON[i][j];
                var hexagon = createHexagon(hexJSON, j, i);

                // Add to row
                hexagonRow.push(hexagon);
            }
            hexagons.push(hexagonRow);
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

        return hexagon;
    }

    //====== Initialization ===================
    var init = (function() {
        extractGameboard();
    })();

    return instMethods;
};