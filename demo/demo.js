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
    var copiedHex = null;

    var straightId = "menu-item-straight";
    var curvedId = "menu-item-curved";
    var engineId = "menu-item-engine";
    var carId = "menu-item-car";
    var obstacleId = "menu-item-obstacle";
    var targetsId = "menu-item-targets";
    var targetsCarId = "menu-item-targets-car";

    var straight = {id: straightId};
    var curved = {id: curvedId};
    var target = {id: targetsId, color: 'navy'};
    var engineItem = {id: engineId,
                      color: 'white',
                      engine: true,
                      train: true};
    var carItem = {id: carId,
                   color: 'white',
                   engine: false,
                   train: true};
    var obstacleItem = {id: obstacleId,
                        color: 'black',
                        engine: false,
                        train: true};
    var targetsCarItem = {id: targetsCarId,
                        color: 'navy',
                        engine: false,
                        train: true};

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
        if (id === targetsId)
            selected_item = target;
        else if (id === straightId)
            selected_item = straight;
        else if (id === curvedId)
            selected_item = curved;
        else if (id === obstacleId)
            selected_item = obstacleItem;
        else if (id === engineId)
            selected_item = engineItem;
        else if (id === carId)
            selected_item = carItem;
        else if (id === targetsCarId)
            selected_item = targetsCarItem;
        else
            selected_item = id
    }

    var itemSelectMouseHandler = function(e){
        if (mouse !== null){
            mouse.remove();
        }
        if (selected_item !== 'erase' && 
            selected_item !== 'rotate' && selected_item !== 'copy') {
            
            mouse = Hexagon(two, e.pageX, e.pageY, RADIUS, 6);
            if (selected_item.train){
                mouse.draw(straight,0);
            }
            mouse.draw(selected_item, 0, mouse.getTracks()[0]);
            mouse.setFill("rgba(0,0,0,0)");
        } else {
            var half = two.makeRectangle(e.pageX, e.pageY, 10, 40);
            half.fill = "rgba(255,0,0,.5)";
            half.rotation = Math.PI/4;
            half.noStroke();
            var half2 = two.makeRectangle(e.pageX, e.pageY, 10, 40);
            half2.fill = "rgba(255,0,0,.5)";
            half2.rotation = -Math.PI/4;
            half2.noStroke();
            mouse = {shape: [half, half2], 
                     remove: function(){two.remove(half,half2);two.update();}
            };
        }
        two.update();
    }

    function populateMenu() {
        var tracks = $("#tracks");
        var trains = $("#trains");
        var targets = $("#targets");
        tracks.append("<div class='item-wrapper'><div class='item' id='"+straightId+"''></div></div>");
        tracks.append("<div class='item-wrapper'><div class='item' id='"+curvedId+"'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='"+engineId+"'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='"+carId+"'></div></div>");
        trains.append("<div class='item-wrapper'><div class='item' id='"+obstacleId+"'></div></div>");
        targets.append("<div class='item-wrapper'><div class='item' id='"+targetsId+"'></div></div>");
        targets.append("<div class='item-wrapper'><div class='item' id='"+targetsCarId+"'></div></div>");
        $(".item").on('click', function() {
            var id = $(this).attr('id');
            console.log(id);
            $("#drawCanvas").off('mousemove');
            $("#drawCanvas").off('mousedown');
            $("#drawCanvas").off('click');
            $("#drawCanvas").unbind('mouseup');
            if (selected_item === null || (id !== selected_item.id && id !== selected_item)){
                if (selected_item !== null) {
                    $("#"+selected_item.id+".item").removeClass('clicked');
                    if(selected_item.id === undefined)
                        $("#"+selected_item+".item").removeClass('clicked');
                }
                setSelectedItem(id);
                $(this).addClass('clicked');
                $("#drawCanvas").bind('mousemove', itemSelectMouseHandler);
                $("#drawCanvas").on('mousedown', function(e) {
                    
                    var id = getHexObjFromPos(e.pageX,e.pageY).getId();
                    if (id !== selected_hex){
                        ;
                        $('#'+id).click();
                    }
                    //mouse.setPosition(hexagonMap[id].x,hexagonMap[id].y);
                    if (selected_item === 'erase' || selected_item === 'rotate'){
                        return;
                    }
                    if (selected_item === 'copy'){
                        mouse.remove();
                        copiedHex = hexagonMap[selected_hex].copy();
                        copiedHex.setFill("rgba(0,0,0,0)");
                        $("#drawCanvas").unbind("mousemove");
                        $("#drawCanvas").bind("mousemove", function(e){
                            
                            copiedHex.setPosition(e.pageX, e.pageY);
                            //mouse.removeLines();
                        });
                        return;
                    }
                    if (selected_item !== null){
                        mouse.setPosition(hexagonMap[selected_hex].getPosition().x, hexagonMap[selected_hex].getPosition().y);
                        $("#drawCanvas").unbind("mousemove");
                        $("#drawCanvas").bind("mousemove", function(e){
                            var dy = mouse.getPosition().y - e.pageY;
                            var dx = e.pageX - mouse.getPosition().x;
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
                    if (selected_item === 'erase'){
                        if (hexagonMap[selected_hex].hasTrain()){
                            console.log('train');
                            hexagonMap[selected_hex].removeTrain();
                        }
                        else {
                            console.log('tracks');
                            hexagonMap[selected_hex].removeLines();
                        }
                        return;
                    }
                    if (selected_item === 'rotate'){
                        if (e.which === 1)
                            hexagonMap[selected_hex].rotateLeft();
                        if (e.which === 3)
                            hexagonMap[selected_hex].rotateRight();
                        return;
                    }
                    if (selected_item === 'copy'){
                        $("#drawCanvas").unbind("mousemove");
                        $("#drawCanvas").bind('mousemove', itemSelectMouseHandler);
                        var id = getHexObjFromPos(e.pageX,e.pageY).getId();
                        if (id !== selected_hex){
                            $('#'+id).click();
                            copiedHex.echo(hexagonMap[selected_hex]);
                        }
                        copiedHex.remove();
                        copiedHex = null;
                        return;
                    }
                    mouse.removeLines();
                    var dy = mouse.getPosition().y - e.pageY;
                    var dx = e.pageX - mouse.getPosition().x;
                    var theta = Math.atan2(dy,dx) * 180/Math.PI;
                    var tracks = hexagonMap[selected_hex].getTracks();
                        //console.log(tracks);
                    var index = Math.floor((theta+179)/(360/tracks.length));

                    hexagonMap[selected_hex].draw(selected_item,theta,tracks[index]);
                    

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
                $("#drawCanvas").off('mousemove');
                $("#drawCanvas").off('mousedown');
                $("#drawCanvas").off('click');
                $("#drawCanvas").unbind('mouseup');
            }
        });
        var line = $("#"+straightId);
        var item_params = {width: 66, height: 66};
        var straightTwo = new Two(item_params).appendTo(line[0]);
        var hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw(straight, 0);

        var curve = $("#"+curvedId);
        straightTwo = new Two(item_params).appendTo(curve[0]);
        hexagon = Hexagon(straightTwo, 66/2., 66/2., RADIUS);
        hexagon.draw(curved, 0);

        var engine = $("#"+engineId);
        var engineTwo = new Two(item_params).appendTo(engine[0]);
        var engineHexagon = Hexagon(engineTwo, 66/2., 66/2., RADIUS);
        engineHexagon.draw(straight, 0);
        engineHexagon.draw(engineItem, 0, engineHexagon.getTracks()[0]);
        engineTwo.update();
        

        var car = $("#"+carId);
        var carTwo = new Two(item_params).appendTo(car[0]);
        var carHexagon = Hexagon(carTwo, 66/2., 66/2., RADIUS);
        carHexagon.draw(straight, 0);
        carHexagon.draw(carItem, 0, carHexagon.getTracks()[0]);
        carTwo.update();

        var obstacle = $("#"+obstacleId);
        carTwo = new Two(item_params).appendTo(obstacle[0]);
        var obsHexagon = Hexagon(carTwo, 66/2., 66/2., RADIUS);
        obsHexagon.draw(straight, 0);
        obsHexagon.draw(obstacleItem, 0, obsHexagon.getTracks()[0]);
        carTwo.update();

        var targetDom = $("#"+targetsId);
        carTwo = new Two(item_params).appendTo(targetDom[0]);
        var targetHexagon = Hexagon(carTwo, 66/2., 66/2., RADIUS);
        targetHexagon.draw(straight, 0);
        targetHexagon.draw(target);
        carTwo.update();

        var targetCars = $("#"+targetsCarId);
        carTwo = new Two(item_params).appendTo(targetCars[0]);
        var tcarHex = Hexagon(carTwo, 66/2., 66/2., RADIUS);
        tcarHex.draw(straight, 0);
        tcarHex.draw(targetsCarItem, 0, tcarHex.getTracks()[0]);
        carTwo.update();



/*
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
        });*/
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




