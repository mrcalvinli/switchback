/**
 * Gameboard representing a switchback game
 */
var GameBoard = function(two, gameboardJSON) {

    //Instance Variables
    var RADIUS;
    var NUM_HORIZONTAL_HEX;
    var NUM_VERTICAL_HEX;

    var hexagons;

    //====== Public Methods ===================

    var instMethods = {}

    //====== Private Methods ==================

    /**
     * 
     */
    var extractGameboard = function(gameboardJSON) {
        RADIUS = gameboardJSON['hexRadius'];
        NUM_HORIZONTAL_HEX = gameboardJSON['numHoriontal'];
        NUM_VERTICAL_HEX = gameboardJSON['numVertical'];

        createHexagonsOnBoard(gameboardJSON['hexagons']);
    };

    /**
     *
     */
    var createHexagonsOnBoard = function(hexagonsJSON) {
        for (var i = 0; i < NUM_VERTICAL_HEX; i++) {
            var hexagonRow = [];
            for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {

                var hexFromJSON = hexagonsJSON[i][j];

            }
        }
    }

    /**
     * Create hexagon from hexagon JSON object
     *
     * @param hexJSON - JSON of hexagon extracted from the gameboard JSON
     * @param xIndex - horizontal index on board
     * @param yIndex - vertical index on board
     */
    var createHexagon = function(hexJSON, xIndex, yIndex) {

    }

    //====== Initialization ===================
    var init = (function() {

    });

    // TODO
    return instMethods;
};