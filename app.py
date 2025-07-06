from flask import Flask, request, jsonify, send_from_directory, redirect
from flask_cors import CORS  # ✅ Đã dùng CORS
import qrcode
import base64
import string
import random
import json
import os
from io import BytesIO
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='.', static_url_path='')

# ✅ Chỉnh CORS cho phép từ mọi domain (hoặc cấu hình cụ thể origin nếu muốn)
CORS(app, origins=["https://tym-love-univers.onrender.com"])

TOKEN_FILE = 'tokens.json'

# Tạo token ngẫu nhiên
def generate_token(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Tải hoặc khởi tạo file token
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
    return send_from_directory('.', 'index.html')

@app.route('/heart.html')
def heart():
    return send_from_directory('.', 'heart.html')

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    data = request.get_json()
    url = data.get('url')
    print("📦 Received URL:", url)

    # Tạo token và thời gian hết hạn sau 1 giờ
    token = generate_token()
    expire_at = (datetime.utcnow() + timedelta(hours=1)).timestamp()

    # Lưu token
    tokens = load_tokens()
    tokens[token] = {"url": url, "expire": expire_at}
    save_tokens(tokens)

    # Tạo QR code trỏ đến đường dẫn chứa token
    full_link = request.host_url + f'qr/{token}'
    print("🔗 Token link:", full_link)

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
