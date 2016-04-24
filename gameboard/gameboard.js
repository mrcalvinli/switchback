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
    var hexagonMap = [];

    /**
     * Holds which hexagon is clicked on
     */
    var selected_hex = null;

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
            for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
                // Create hexagon
                var hexJSON = hexagonsJSON[i][j];
                var hexagon = createHexagon(hexJSON, j, i);

                // Add to map
                hexagonMap[hexagon.getId()] = hexagon;
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
            if (id !== selected_hex) {
                if (selected_hex !== null)
                    hexagonMap[selected_hex].clickedMode(false);
                selected_hex = id;
                hexagonMap[id].clickedMode(true);
            } else {
                hexagonMap[selected_hex].clickedMode(false);
                selected_hex = null;
            }
            two.update();
        });
    }

    //====== Initialization ===================
    var init = (function() {
        extractGameboard();
    })();

    return instMethods;
};