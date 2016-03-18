$(document).ready(function() {

    var RADIUS = 30;
    var NUM_HORIZONTAL_HEX = 14;
    var NUM_VERTICAL_HEX = 16;
    var horizontalDistance = RADIUS * Math.sqrt(3)/2.0;

    var elem = document.getElementById('drawCanvas');
    var params = {width: (NUM_HORIZONTAL_HEX-1)*2*horizontalDistance, 
                  height: (NUM_VERTICAL_HEX-1)*1.5*RADIUS};
    var two = new Two(params).appendTo(elem);
    var elem2 = document.getElementById('track-menu');
    var params2 = {width: 300, height: 500};
    var menuTwo = new Two(params2).appendTo(elem2);

    
    var selected_hex = null;
    var selected_item = null;

    

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

    function populateMenu() {
        var tracks = $("#tracks");
        var trains = $("#trains");
        tracks.append("<div class='item' id='menu-item-straight'></div>");
        tracks.append("<div class='item' id='menu-item-curved'></div>");
        trains.append("<div class='item' id='menu-item-gold'></div>");
        trains.append("<div class='item' id='menu-item-blue'></div>");
        $(".item").on('click', function() {
            var id = $(this).attr('id');
            console.log(id);
            if (id !== selected_item){
                if (selected_item !== null) {
                    $("#"+selected_item+".item").removeClass('clicked');
                }
                selected_item = id;
                $(this).addClass('clicked');

            } else {
                selected_item = null;
                $(this).removeClass('clicked');
            }
        });
        var straight = $("#menu-item-straight");
        var hexagon = Hexagon(menuTwo, straight.position().left, straight.position().top, RADIUS)
    }

    populateMenu();

    var hexagonMap = {};
    for (var i = 0; i < NUM_VERTICAL_HEX; i++) {
        for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
            var x = 2*j*horizontalDistance + (i % 2) * horizontalDistance;
            var y = 1.5*i*RADIUS;
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




