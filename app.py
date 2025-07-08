from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
import qrcode, base64, string, random, json, os
from io import BytesIO
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='templates')
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
def heart_old():  # giữ lại nếu muốn hỗ trợ link cũ
    return render_template('heart.html')

@app.route('/heart/<token>')
def heart_token(token):
    return render_template('heart.html')

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    try:
        data = request.get_json()
        print("🧾 JSON nhận được:", data)

        if not data:
            return jsonify({'error': 'Thiếu dữ liệu'}), 400

        # 🔒 Kiểm tra kích thước ảnh
        if 'images' in data:
            for i, base64_str in enumerate(data['images']):
                approx_size = len(base64_str) * 0.75
                if approx_size > 1_000_000:
                    return jsonify({
                        'error': f"Hình ảnh thứ {i+1} vượt quá 1MB. Vui lòng chọn ảnh nhỏ hơn."
                    }), 400

        # ✅ Lưu tất cả thông tin vào token
        token = generate_token()
        expire_at = (datetime.utcnow() + timedelta(minutes=15)).timestamp()

        tokens = load_tokens()
        tokens[token] = {
            "music": data.get("music"),
            "mainText": data.get("mainText"),
            "subText": data.get("subText"),
            "messages": data.get("messages"),
            "images": data.get("images"),
            "expire": expire_at
        }
        save_tokens(tokens)

        # 🔗 Chỉ tạo QR link ngắn gọn
        full_link = request.host_url.rstrip('/') + f'/heart/{token}'
        print("🔗 Link QR:", full_link)

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(full_link)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({'qr': f'data:image/png;base64,{img_str}', 'link': full_link})
    
    except Exception as e:
        print("❌ Lỗi tạo QR:", str(e))
        return jsonify({'error': 'Lỗi server khi tạo QR'}), 500

@app.route('/token-data/<token>')
def get_token_data(token):
    tokens = load_tokens()
    entry = tokens.get(token)
    if not entry:
        return jsonify({'error': 'Token không tồn tại'}), 404
    if datetime.utcnow().timestamp() > entry['expire']:
        return jsonify({'error': 'Token đã hết hạn'}), 403
    return jsonify(entry)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
