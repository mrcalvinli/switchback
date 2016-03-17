$(document).ready(function() {
    var elem = document.getElementById('drawCanvas');
    var params = {width: 700, height: 700};
    var two = new Two(params).appendTo(elem);

    var RADIUS = 30;
    var NUM_HORIZONTAL_HEX = 10;
    var NUM_VERTICAL_HEX = 10;
    var selected_hex = null;

    var horizontalDistance = RADIUS * Math.sqrt(3)/2.0

    /**
     * Adding event handlers to hexagon
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
            if (id !== selected_hex){
                if (selected_hex !== null)
                    hexagonMap[selected_hex].clickedMode(false);
                selected_hex = id;
                hexagonMap[id].clickedMode(true);
            }
        });
    }

    var hexagonMap = {};
    for (var i = 0; i < NUM_VERTICAL_HEX; i++) {
        for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
            var x = horizontalDistance + 2*j*horizontalDistance + (i % 2) * horizontalDistance;
            var y = RADIUS + 1.5*i*RADIUS;
            var hexagon = Hexagon(two, x, y, RADIUS)

            addHexagonEventHandlers(hexagon);

            hexagonMap[hexagon.getId()] = hexagon;
        }
    }
});

/*
makeHexagon(200, 500);

var anchor1 = new Two.Anchor(200 - 21, 500 - 37, 0, 0, 21, 27, Two.Commands.curve);
var anchor2 = new Two.Anchor(200 - 21, 500 + 37, 21, -27, 0, 500, Two.Commands.curve);

var path = two.makeCurve([anchor1, anchor2], true);
path.linewidth = 1;
path.stroke = "#aaaaaa";
path.fill = '#eeeeee';*/




