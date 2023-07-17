$(document).ready(function () {

  var board,
    game = new Chess();

  $("#new-game").on("click", function () {
    fetch('http://127.0.0.1:5000/generate_position', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color: "w" })
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
        console.log('Error:', error);
      });
  });

  // Undo button
  $("#undo").on("click", function () {
    game.undo();
    game.undo();
    board.position(game.fen());
    renderMoveHistory(game.history());
  });

  // Resign button
  $("#resign").on("click", function () {
    if (game.turn() === "w") {
      alert("Black wins by resignation");
    } else {
      alert("White wins by resignation");
    }
  });

  // Claim draw button
  $("#claim-draw").on("click", function () {
    if (
      game.in_drawfold_repetition() ||
      game.in_fifty_moves()
    ) {
      alert("Game ends in a draw");
    }
  });

  // FEN input button
  $("#set-fen").on("click", function () {
    var fen = $("#fen").val();
    game.load(fen);
    board.position(game.fen());
  });

  $("#set-elo").on("click", function () {
    var elo = parseInt($("#elo").val());
    engine.setSkillLevel(elo);
    var legalMoves = game.moves();
    var move = engine.move(legalMoves);
    game.move(move);
    board.position(game.fen());
    updateStatus();
  });

  var onDragStart = function (source, piece, position, orientation) {
    if (
      game.in_checkmate() === true ||
      game.in_draw() === true ||
      (piece.search(/^b/) !== -1 && !playerVsPlayerMode)
    ) {
      return false;
    }
  };

  var makeBestMove = function () {
    var fen = game.fen();
    fetch('http://127.0.0.1:5000/get_best_move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fen: fen })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var bestMove = data.Best_Move;
        console.log(data.Centipawn_loss);
        console.log(bestMove);
        if (bestMove) {
          game.move({from: bestMove[0], to: bestMove[1], promotion: "q"});
          board.position(game.fen());
          renderMoveHistory(game.history());
          if (game.game_over()) {
            alert('Game over');
          }
        }
      })
      .catch(function (error) {
        console.log('Error:', error);
      });
  };

  var renderMoveHistory = function (moves) {
    var historyElement = $("#move-history").empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
      historyElement.append("<span>" + moves[i] + " " + (moves[i + 1] ? moves[i + 1] : " ") + "</span><br>");
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);
  };

  var playerVsPlayerMode = false;
  $("#toggle-mode").on("click", function () {
    playerVsPlayerMode = !playerVsPlayerMode;
    if (playerVsPlayerMode) {
      $(this).text("Current Mode: Player vs Player");
    } else {
      $(this).text("Current Mode: Player vs Ai");
    }
  });

  var onDrop = function (source, target) {
    var move = game.move({
      from: source,
      to: target,
      promotion: "q",
    });
    removeGreySquares();
    if (move === null) {
      return "snapback";
    }
    renderMoveHistory(game.history());
    if (!playerVsPlayerMode) {
      window.setTimeout(function () {
        makeBestMove(true);
      }, 250);
    }
  };

  var onSnapEnd = function () {
    board.position(game.fen());
  };

  var onMouseoverSquare = function (square, piece) {
    var moves = game.moves({
      square: square,
      verbose: true,
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
    }
  };

  var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
  };

  var removeGreySquares = function () {
    $("#board .square-55d63").css("background", "");
  };

  var greySquare = function (square) {
    var squareEl = $("#board .square-" + square);

    var background = "#a9a9a9";
    if (squareEl.hasClass("black-3c85d") === true) {
      background = "#696969";
    }

    squareEl.css("background", background);
  };

  var cfg = {
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,
  };
  board = ChessBoard("board", cfg);
});
