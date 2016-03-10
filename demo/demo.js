var elem = document.getElementById('drawCanvas');
console.log(elem);
var params = {width: 700, height: 700};
var two = new Two(params).appendTo(elem);

function makeHexagon(x, y) {
	var hexagon = two.makePolygon(x, y, 50, 6);

	hexagon.fill = '#eeeeee';
	hexagon.stroke = '#aaaaaa';
	hexagon.linewidth = 1;
	hexagon.rotation = Math.PI / 6;

	return hexagon;
}

for (var i = 0; i < 4; i++) {
	for (var j = 0; j < 4; j++) {
		makeHexagon(44 + 43*2*j + 43*i, 50 + 75*i);
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




