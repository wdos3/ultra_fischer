$(document).ready(function () {

    var board, game = new Chess();
    $("#white-player").on("click", function () {
    fetch("http://127.0.0.1:5000/generate_position", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify()
    })
        .then(function (response) {
        return response.json();
        })
        .then(function (data) {
        console.log(data.Position);
        console.log(data.Centipawn_loss);
        var fen = data.Position;
        game.load(fen);
        board.position(game.fen());
        })
        .catch(function (error) {
        console.log("Error:", error);
        });
    });

    $("#black-player").on("click", function () {
    fetch("http://127.0.0.1:5000/generate_position", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify()
    })
        .then(function (response) {
        return response.json();
        })
        .then(function (data) {
        console.log(data.Position);
        console.log(data.Centipawn_loss);
        var fen = data.Position;
        game.load(fen);
        board.position(game.fen());
        })
        .catch(function (error) {
        console.log("Error:", error);
        });
    });

    pieceColor = ["w","b"]

    $("#random-player").on("click", function () {
    fetch("http://127.0.0.1:5000/generate_position", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(),
    })
        .then(function (response) {
        return response.json();
        })
        .then(function (data) {
        console.log(data.Position);
        console.log(data.Centipawn_loss);
        var fen = data.Position;
        game.load(fen);
        board.position(game.fen());
        })
        .catch(function (error) {
        console.log("Error:", error);
        });
    });
});