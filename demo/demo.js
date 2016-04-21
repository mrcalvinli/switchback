$(document).ready(function() {

    var RADIUS = 30;
    var NUM_HORIZONTAL_HEX = 14;
    var NUM_VERTICAL_HEX = 16;
    var horizontalDistance = RADIUS * Math.sqrt(3)/2.0;
    var firstHex = 0;

    var elem = document.getElementById('drawCanvas');
    var params = {width: (NUM_HORIZONTAL_HEX-.5)*2*horizontalDistance, 
                  height: (NUM_VERTICAL_HEX-.5)*1.5*RADIUS};
    var two = new Two(params).appendTo(elem);
    var selected_hex = null;
    var selected_item = null;
    var mouse = null;

    var straight = {id: 'menu-item-straight'};
    var curved = {id: 'menu-item-curved'};
    var goldItem = {id: 'menu-item-gold',
                    color: 'gold',
                    engine: true,
                    train: true};
    var blueItem = {id: 'menu-item-blue',
                    color: 'navy',
                    engine: true,
                    train: true};
    var lineErase = {id: 'menu-item-erase-line'};
    var trainErase = {id: 'menu-item-erase-train'};

    var getHexCenter = function(xIndex, yIndex) {
        return {
            x: 2*xIndex*horizontalDistance + (yIndex % 2) * horizontalDistance,
            y: 1.5*yIndex*RADIUS
        }
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
        var hexId = closestHexIndex[0] + closestHexIndex[1]*NUM_HORIZONTAL_HEX + firstHex;
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
            } else {
                hexagonMap[selected_hex].clickedMode(false);
                //hexagonMap[selected_hex].removeLines();
                selected_hex = null;
            }
            two.update();
        });
    }

    var setSelectedItem = function(id){
        if (id === "menu-item-erase-train")
            selected_item = trainErase;
        else if (id === "menu-item-straight")
            selected_item = straight;
        else if (id === "menu-item-curved")
            selected_item = curved;
        else if (id === "menu-item-erase-line")
            selected_item = lineErase;
        else if (id === "menu-item-gold")
            selected_item = goldItem;
        else if (id === "menu-item-blue")
            selected_item = blueItem;
    }

    var itemSelectMouseHandler = function(e){
        if (mouse !== null)
            mouse.remove();
        mouse = Hexagon(two, e.clientX, e.clientY, RADIUS, 6);
        if (selected_item.train || 
            selected_item.id === "menu-item-erase-train"){
            mouse.draw(straight,0);
        }
        mouse.draw(selected_item, 0, mouse.getTracks()[0]);
        mouse.setFill("rgba(0,0,0,0)");
        if (selected_item.id === "menu-item-erase-line" || 
            selected_item.id === "menu-item-erase-train"){
            mouse.setFill("rgba(255,0,0,.5)");
        }
        two.update();
    }

    function populateMenu() {
        var tracks = $("#tracks");
        var trains = $("#trains");
        tracks.append("<div class='item-wrapper'><div class='item' id='menu-item-straight'></div></div>");
        tracks.append("<div class='item-wrapper'><div class='item' id='menu-item-curved'></div></div>");
        tracks.append("<div class='item-wrapper'><div class='item' id='menu-item-erase-line'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='menu-item-gold'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='menu-item-blue'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='menu-item-erase-train'></div></div>");
        $(".item").on('click', function() {
            var id = $(this).attr('id');
            console.log(id);
            if (selected_item === null || id !== selected_item.id){
                if (selected_item !== null) {
                    $("#"+selected_item.id+".item").removeClass('clicked');
                }
                setSelectedItem(id);
                $(this).addClass('clicked');
                $("#drawCanvas").bind('mousemove', itemSelectMouseHandler);
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
                            mouse.removeTrain();
                            var tracks = hexagonMap[selected_hex].getTracks();
                            //console.log(tracks);
                            var index = Math.floor((theta+179)/(360/tracks.length));
                            //console.log(index);
                            mouse.draw(selected_item,theta,tracks[index]);

                            //mouse.removeLines();
                        });
                    }
                });
                $("#drawCanvas").on('mouseup', function(e) {
                    mouse.removeLines();
                    var dy = mouse.getPosition().y - e.clientY;
                    var dx = e.clientX - mouse.getPosition().x;
                    var theta = Math.atan2(dy,dx) * 180/Math.PI;
                    var tracks = hexagonMap[selected_hex].getTracks();
                        //console.log(tracks);
                    var index = Math.floor((theta+179)/(360/tracks.length));
                    
                    if (selected_item.id === 'menu-item-erase-line'){
                        hexagonMap[selected_hex].removeLines();
                    } else if (selected_item.id === 'menu-item-erase-train'){
                        hexagonMap[selected_hex].removeTrain();
                    }
                    else{
                        hexagonMap[selected_hex].draw(selected_item,theta,tracks[index]);
                    }

                    $("#drawCanvas").unbind("mousemove");
                    $("#drawCanvas").bind("mousemove", itemSelectMouseHandler);
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
        var line = $("#menu-item-straight");
        var item_params = {width: 66, height: 66};
        var straightTwo = new Two(item_params).appendTo(line[0]);
        var hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw(straight, 0);

        var curve = $("#menu-item-curved");
        straightTwo = new Two(item_params).appendTo(curve[0]);
        hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw(curved, 0);

        var line_erase = $('#menu-item-erase-line');
        straightTwo = new Two(item_params).appendTo(line_erase[0]);
        hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.setFill("red");



        var gold = $("#menu-item-gold");
        var goldTwo = new Two(item_params).appendTo(gold[0]);
        var goldHexagon = Hexagon(goldTwo, 66/2., 66/2., RADIUS);
        goldHexagon.draw(straight, 0);
        goldHexagon.draw(goldItem, 0, goldHexagon.getTracks()[0]);
        goldTwo.update();
        
        

        var blue = $("#menu-item-blue");
        var blueTwo = new Two(item_params).appendTo(blue[0]);
        var blueHexagon = Hexagon(blueTwo, 66/2., 66/2., RADIUS);
        blueHexagon.draw(straight, 0);
        blueHexagon.draw(blueItem, 0, blueHexagon.getTracks()[0]);
        blueTwo.update();
        

        var train_erase = $('#menu-item-erase-train');
        goldTwo = new Two(item_params).appendTo(train_erase[0]);
        hexagon = Hexagon(goldTwo, 66/2., 66/2., RADIUS);
        hexagon.setFill("red");
        hexagon.draw(straight, 0);
        hexagon.draw({train:true, 
            color: "gold", engine:"true"}, 0, hexagon.getTracks()[0]);
        goldTwo.update();

        gold.before("<div class='gold-engine type-select'></div>"+
                    "<div class='gold-car type-select'></div>");
        blue.before("<div class='blue-engine type-select'></div>"+
                    "<div class='blue-car type-select'></div>");
        $('.gold-car').click(function(){
            goldItem.engine = false;
            goldHexagon.draw(goldItem, 0, goldHexagon.getTracks()[0]);
        });
        $('.blue-car').click(function(){
            blueItem.engine = false;
            blueHexagon.draw(blueItem, 0, blueHexagon.getTracks()[0]);
        });
        $('.gold-engine').click(function(){
            goldItem.engine = true;
            goldHexagon.draw(goldItem, 0, goldHexagon.getTracks()[0]);
        });
        $('.blue-engine').click(function(){
            blueItem.engine = true;
            blueHexagon.draw(blueItem, 0, blueHexagon.getTracks()[0]);
        });
    }

    populateMenu();

    var hexagonMap = {};
    for (var i = 0; i <= NUM_VERTICAL_HEX; i++) {
        for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {

            var center = getHexCenter(j, i);
            var hexagon = Hexagon(two, center.x, center.y, RADIUS, j, i)
            if(i === 0 && j === 0){
                firstHex = Number(hexagon.getId().substring(4));
            }
            addHexagonEventHandlers(hexagon);

            hexagonMap[hexagon.getId()] = hexagon;
        }
    }

    // pathfinding = PathFinding(hexagonMap, {
    //     RADIUS: RADIUS,
    //     NUM_HORIZONTAL_HEX: NUM_HORIZONTAL_HEX,
    //     NUM_VERTICAL_HEX: NUM_VERTICAL_HEX
    // });
});


/*
makeHexagon(200, 500);

var anchor1 = new Two.Anchor(200 - 21, 500 - 37, 0, 0, 21, 27, Two.Commands.curve);
var anchor2 = new Two.Anchor(200 - 21, 500 + 37, 21, -27, 0, 500, Two.Commands.curve);

var path = two.makeCurve([anchor1, anchor2], true);
path.linewidth = 1;
path.stroke = "#aaaaaa";
path.fill = '#eeeeee';*/




