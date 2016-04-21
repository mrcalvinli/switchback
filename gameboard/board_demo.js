$(document).ready(function() {

    var gameboardJSON = {
        "numHorizontal": 5,
        "numVertical": 5,
        "hexRadius": 30,
        "hexagons": [
            [null, null, null, null, null], 
            [null, null, { "lineTracks": [0], "arcTracks": [0, 3], "train": null } , null, null], 
            [null, null, null, null, null], 
            [null, null, null, null, null], 
            [null, null, null, null, null]
        ]
    }
    var elem = document.getElementById('drawCanvas');
    var params = {width: 500, height: 500};
    var two = new Two(params).appendTo(elem);

    board = GameBoard(two, gameboardJSON);
    two.update();
});