$(document).ready(function() {

    var RADIUS = 30;
    var NUM_HORIZONTAL_HEX = 14;
    var NUM_VERTICAL_HEX = 16;
    var horizontalDistance = RADIUS * Math.sqrt(3)/2.0;

    var elem = document.getElementById('drawCanvas');
    var params = {width: (NUM_HORIZONTAL_HEX-.5)*2*horizontalDistance, 
                  height: (NUM_VERTICAL_HEX-.5)*1.5*RADIUS};
    var two = new Two(params).appendTo(elem);
    var selected_hex = null;
    var selected_item = null;
    var mouse = null;

    var getHexCenter = function(xIndex, yIndex) {
        return {
            x: 2*xIndex*horizontalDistance + (yIndex % 2) * horizontalDistance,
            y: 1.5*yIndex*RADIUS
        }
    }

    var getHexFromPos = function(x,y){
        console.log(x+", "+y);
        var num = Math.floor(y/(1.5*RADIUS))*NUM_HORIZONTAL_HEX+
                  Math.floor(x/(2*horizontalDistance))+9;
        console.log(Math.floor(y/(1.5*RADIUS))+", "+Math.floor(x/(2*horizontalDistance)));
        var hex = $('#drawCanvas').find('#two_'+num);
        console.log(hex);
        return hex;
    }

    var getHexObjFromPos = function(x, y) {
        var leftHexIndexY = Math.floor(y/(RADIUS*1.5));
        var leftHexIndexX = Math.floor((x - (leftHexIndexY % 2)*horizontalDistance)/(2*horizontalDistance));

        var leftHexIndex = [leftHexIndexX, leftHexIndexY];
        var rightHexIndex = [leftHexIndexX + 1, leftHexIndexY];
        var bottomHexIndex = [leftHexIndexX + leftHexIndexY % 2, leftHexIndexY + 1];

        var hexIndexArray = [leftHexIndex, rightHexIndex, bottomHexIndex];
        var closestHexIndex = undefined;
        var shortestDistance = 10000;
        for (var i = 0; i < hexIndexArray.length; i++) {
            var hexIndexX = hexIndexArray[i][0];
            var hexIndexY = hexIndexArray[i][1];
            var hexCenter = getHexCenter(hexIndexX, hexIndexY);

            var distance = Math.sqrt(Math.pow(x - hexCenter.x, 2) + Math.pow(y - hexCenter.y, 2));

            if (distance < shortestDistance) {
                closestHexIndex = hexIndexArray[i];
                shortestDistance = distance;
            }
        }

        var hexId = closestHexIndex[0] + closestHexIndex[1]*NUM_HORIZONTAL_HEX + 11;
        //console.log(hexId);
        return hexagonMap['two_'+hexId];
    }    

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
            if (id !== selected_hex) {
                if (selected_hex !== null)
                    hexagonMap[selected_hex].clickedMode(false);
                selected_hex = id;
                hexagonMap[id].clickedMode(true);
                //hexagonMap[id].drawPath(3, 6);
            } else {
                hexagonMap[selected_hex].clickedMode(false);
                hexagonMap[selected_hex].removeLines();
                selected_hex = null;
            }
            two.update();
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
                $("#drawCanvas").bind('mousemove', function(e){
                    if (mouse !== null)
                        mouse.remove();
                    mouse = Hexagon(two, e.clientX, e.clientY, RADIUS, 6);
                    if (selected_item === "menu-item-gold"){
                        mouse.draw("menu-item-straight",0);
                    }
                    mouse.draw(selected_item, 0);
                    console.log("hi");
                    mouse.setFill("rgba(0,0,0,0)");
                    two.update();
                });
                $("#drawCanvas").on('mousedown', function(e) {
                    var id = getHexObjFromPos(e.clientX,e.clientY).getId();
                    if (id !== selected_hex){
                        $('#'+id).click();
                    }
                    //mouse.setPosition(hexagonMap[id].x,hexagonMap[id].y);
                    if (selected_item !== null){
                        $("#drawCanvas").unbind("mousemove");
                        $("#drawCanvas").bind("mousemove", function(e){
                            var dy = mouse.getPosition().y - e.clientY;
                            var dx = e.clientX - mouse.getPosition().x;
                            var theta = Math.atan2(dy,dx) * 180/Math.PI;

                            mouse.removeLines();
                            mouse.draw(selected_item,theta);
                            //mouse.removeLines();
                        });
                    }
                });
                $("#drawCanvas").on('mouseup', function(e) {
                    mouse.removeLines();
                    var dy = mouse.getPosition().y - e.clientY;
                    var dx = e.clientX - mouse.getPosition().x;
                    var theta = Math.atan2(dy,dx) * 180/Math.PI;
                    hexagonMap[selected_hex].draw(selected_item,theta);
                    $("#drawCanvas").unbind("mousemove");
                    $("#drawCanvas").bind("mousemove", function(e){
                        if (mouse !== null)
                            mouse.remove();
                        mouse = Hexagon(two, e.clientX, e.clientY, RADIUS, 6);
                        mouse.draw(selected_item, 0);
                        mouse.setFill("rgba(0,0,0,0)");
                        two.update();
                    });
                });

            } else {
                selected_item = null;
                if (mouse !== null){
                        mouse.remove();
                        two.update();
                        mouse = null;
                }
                $(this).removeClass('clicked');
                $("#drawCanvas").unbind('mousemove');
                $("#drawCanvas").unbind('mousedown');
                $("#drawCanvas").unbind('mouseup');
            }
        });
        var straight = $("#menu-item-straight");
        var item_params = {width: 66, height: 66};
        var straightTwo = new Two(item_params).appendTo(straight[0]);
        var hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw("menu-item-straight", 0);
        var curve = $("#menu-item-curved");
        straightTwo = new Two(item_params).appendTo(curve[0]);
        hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw("menu-item-curved", 0);

        var gold = $("#menu-item-gold");
        var goldTwo = new Two(item_params).appendTo(gold[0]);
        hexagon = Hexagon(goldTwo, 66/2., 66/2., RADIUS);
        hexagon.draw("menu-item-straight", 0);
        hexagon.draw("menu-item-gold", 0);
        goldTwo.update();

        var blue = $("#menu-item-blue");
        var blueTwo = new Two(item_params).appendTo(blue[0]);
        var blueRect = blueTwo.makeRoundedRectangle(66/2, 66/2, 40, 20, 3);
        blueRect.fill = "navy";
        blueTwo.update();
    }

    populateMenu();

    var hexagonMap = {};
    for (var i = 0; i <= NUM_VERTICAL_HEX; i++) {
        for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
            var center = getHexCenter(j, i);
            var hexagon = Hexagon(two, center.x, center.y, RADIUS)

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




