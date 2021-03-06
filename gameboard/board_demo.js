$(document).ready(function() {

    var gameboardJSON = {
        "numHorizontal": 10,
        "numVertical": 10,
        "hexRadius": 30,
        "hexagons": [
            [null, null, null, null, null, null, null, null, null, null], 
            [null, null, null , null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null, null], 
            [null, null, { "lineTracks": [], "arcTracks": [2]}, { "lineTracks": [], "arcTracks": [3]}, null, null, null, null, null, null], 
            [null, null, { "lineTracks": [1], "arcTracks": []}, null, { "lineTracks": [], "arcTracks": [0, 2]}, { "lineTracks": [2], "arcTracks": []}, { "lineTracks": [2], "arcTracks": []}, { "lineTracks": [2], "arcTracks": []}, { "lineTracks": [2], "arcTracks": []}, { "lineTracks": [2], "arcTracks": []}],
            [{ "lineTracks": [2], "arcTracks": []}, { "lineTracks": [2], "arcTracks": [5]}, { "lineTracks": [2], "arcTracks": []}, { "lineTracks": [], "arcTracks": [5]}, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null]
        ],
        "trains": [
            {
                "hexagonCoord": {
                    "x": 6,
                    "y": 4
                },
                "edges": {
                    "start": 2,
                    "end": 5
                },
                "color": "white",
                "engine": false
            },
            {
                "hexagonCoord": {
                    "x": 7,
                    "y": 4
                },
                "edges": {
                    "start": 2,
                    "end": 5
                },
                "color": "white",
                "engine": true,
                "isForward": true
            },
            {
                "hexagonCoord": {
                    "x": 8,
                    "y": 4
                },
                "edges": {
                    "start": 2,
                    "end": 5
                },
                "color": "white",
                "engine": false
            },{
                "hexagonCoord": {
                    "x": 9,
                    "y": 4
                },
                "edges": {
                    "start": 2,
                    "end": 5
                },
                "color": "white",
                "engine": false
            }
        ]
    }
    var elem = document.getElementById('drawCanvas');
    var params = GameBoardUtil.getBoardSize(gameboardJSON.numHorizontal, gameboardJSON.numVertical, gameboardJSON.hexRadius);
    var two = new Two(params).appendTo(elem);

    $('#drawCanvas').css('width', params.width + 'px').css('height', params.height + 'px');

    board = GameBoard(two, gameboardJSON);
    two.update();
});