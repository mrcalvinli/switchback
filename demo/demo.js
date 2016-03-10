var elem = document.getElementById('drawCanvas');
console.log(elem);
var params = {width: 700, height: 700};
var two = new Two(params).appendTo(elem);

var RADIUS = 30;
var NUM_HORIZONTAL_HEX = 10;
var NUM_VERTICAL_HEX = 10;

var horizontalDistance = RADIUS * Math.sqrt(3)/2.0

function makeHexagon(x, y) {
	var hexagon = two.makePolygon(x, y, RADIUS, 6);

	hexagon.fill = '#eeeeee';
	hexagon.stroke = '#aaaaaa';
	hexagon.linewidth = 1;
	hexagon.rotation = Math.PI / 6;
	two.update();

	$("#" + hexagon.id).hover(function() {
		//hexagon.fill = '#aaeeee';
		$(this).addClass("hover");
		//two.update();
	}, function() {
		//hexagon.fill = '#eeeeee';
		$(this).removeClass("hover");
		//two.update();
	});

	return hexagon;
}

// for (var i = 0; i < 4; i++) {
// 	for (var j = 0; j < 4; j++) {
// 		makeHexagon(44 + 43*2*j + 43*i, 50 + 75*i);
// 	}
// }
for (var i = 0; i < NUM_VERTICAL_HEX; i++) {
	for (var j = 0; j < NUM_HORIZONTAL_HEX; j++) {
		var x = horizontalDistance + 2*j*horizontalDistance + (i % 2) * horizontalDistance;
		var y = RADIUS + 1.5*i*RADIUS;
		makeHexagon(x, y);
	}
}

makeHexagon(200, 500);

var anchor1 = new Two.Anchor(200 - 21, 500 - 37, 0, 0, 21, 27, Two.Commands.curve);
var anchor2 = new Two.Anchor(200 - 21, 500 + 37, 21, -27, 0, 500, Two.Commands.curve);

var path = two.makeCurve([anchor1, anchor2], true);
path.linewidth = 1;
path.stroke = "#aaaaaa";
path.fill = '#eeeeee';

two.update();




