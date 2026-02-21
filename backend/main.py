from

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Cavista backend!"})

if __name__ == '__main__':
    app.run(debug=True)