$(document).ready(function() {

    var gameboardJSON = {
        "numHorizontal": 10,
        "numVertical": 10,
        "hexRadius": 30,
        "hexagons": [
            [null, null, null, null, null, null, null, null, null, null], 
            [null, null, null , null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null, null], 
            [null, null, { "lineTracks": [], "arcTracks": [2], "train": null }, { "lineTracks": [], "arcTracks": [3], "train": null }, null, null, null, null, null, null], 
            [null, null, { "lineTracks": [1], "arcTracks": [], "train": null }, null, { "lineTracks": [], "arcTracks": [0, 2], "train": null }, { "lineTracks": [2], "arcTracks": [], "train": null }, { "lineTracks": [2], "arcTracks": [], "train": null }, { "lineTracks": [2], "arcTracks": [], "train": null }, { "lineTracks": [2], "arcTracks": [], "train": true }, { "lineTracks": [2], "arcTracks": [], "train": null }],
            [{ "lineTracks": [2], "arcTracks": [], "train": null }, { "lineTracks": [2], "arcTracks": [5], "train": null }, { "lineTracks": [2], "arcTracks": [], "train": null }, { "lineTracks": [], "arcTracks": [5], "train": null }, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null]
        ]
    }
    var elem = document.getElementById('drawCanvas');
    var params = GameBoardUtil.getBoardSize(gameboardJSON.numHorizontal, gameboardJSON.numVertical, gameboardJSON.hexRadius);
    var two = new Two(params).appendTo(elem);

    $('#drawCanvas').css('width', params.width + 'px').css('height', params.height + 'px');

    board = GameBoard(two, gameboardJSON);
    two.update();
});