from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import qrcode, base64, string, random, json, os
from io import BytesIO
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='templates')

# ✅ Chỉ cho phép CORS từ domain web chính
CORS(app, origins=["https://tym-love-univers.onrender.com"])

TOKEN_FILE = 'tokens.json'

def generate_token(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def load_tokens():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_tokens(tokens):
    with open(TOKEN_FILE, 'w') as f:
        json.dump(tokens, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/heart.html')
def heart():
    return render_template('heart.html')

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    data = request.get_json()
    url = data.get('url')
    print("📦 URL nhận:", url)

    # Tạo token hết hạn sau 1 giờ
    token = generate_token()
    expire_at = (datetime.utcnow() + timedelta(hours=1)).timestamp()

    # Lưu token vào file
    tokens = load_tokens()
    tokens[token] = {"url": url, "expire": expire_at}
    save_tokens(tokens)

    # Tạo link token
    full_link = request.host_url.rstrip('/') + f'/qr/{token}'
    print("🔗 Link token:", full_link)

    # Tạo QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(full_link)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({'qr': f'data:image/png;base64,{img_str}'})

@app.route('/qr/<token>')
def access_qr(token):
    tokens = load_tokens()
    entry = tokens.get(token)

    if not entry:
        return "❌ Liên kết không tồn tại hoặc đã bị xóa.", 404
    if datetime.utcnow().timestamp() > entry['expire']:
        return "⚠️ QR đã hết hạn sau 1 giờ.", 403

    return redirect(entry['url'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
