from flask import Flask, request
from stockfish import Stockfish
from flask_cors import CORS, cross_origin
from RandomPositions import generatePosition


app = Flask(__name__)
CORS(app)

engine = Stockfish(r"stockfish_15_x64_avx2.exe")
engine.set_depth(10)  # Set the depth for the engine analysis (adjust as needed)
engine.set_skill_level(20)  # Set the engine skill level (adjust as needed)

@app.route('/centipawn_loss', methods=['POST'])
@cross_origin()
def calculate_centipawn_loss():
    fen = request.json['fen']  # Retrieve the FEN code from the request JSON
    engine.set_fen_position(fen)  # Set the position for analysis
    if engine.get_evaluation().get('type') == 'mate':
        result = {'Checkmate': engine.get_evaluation().get('value')}
    else:
        result = {'Centipawn_Loss': engine.get_evaluation().get('value')}
    return result

@app.route('/get_best_move', methods=['POST'])
@cross_origin()
def find_best_move():
    fen = request.json['fen']  # Retrieve the FEN code from the request JSON
    engine.set_fen_position(fen)  # Set the position for analysis
    bm = engine.get_best_move()
    move1, move2 = bm[:len(bm)//2], bm[len(bm)//2:]
    #best_move = {'Best_Move': engine.get_best_move()}
    best_move = {'Best_Move': [move1, move2]}
    centipawn_loss = engine.get_evaluation().get('value')
    best_move = {'Best_Move': [move1, move2], "Centipawn_loss": centipawn_loss}
    return best_move

@app.route('/generate_position', methods=['POST'])
@cross_origin()
def get_position():
    color = request.json['color']
    flag = True
    while flag:
        fen = generatePosition(color)
        engine.set_fen_position(fen)  # Set the position for analysis
        if engine.get_evaluation().get('type') == 'cp':
            result = engine.get_evaluation().get('value')
            if abs(result)<301:
                flag = False
    return {'Position': fen, "Centipawn_loss": result}

if __name__ == '__main__':
    app.run()