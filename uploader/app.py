from flask import Flask, request, jsonify
import os, re, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
UPLOAD_BASE = '/uploads'

EMAIL_MAP = {
    'alex': 'alex',
    'sean': 'sean',
    'tristan': 'tristan',
    'tristan.hormann': 'tristan',
}

def get_username(email):
    if not email:
        return None
    local = email.split('@')[0].lower()
    return EMAIL_MAP.get(local)

def regenerate_index(dest_dir, username):
    files = sorted([f for f in os.listdir(dest_dir) if f != 'index.html'])
    rows = ''.join(f'<tr><td><a href="{f}">{f}</a></td></tr>' for f in files)
    html = f"""<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=UTF-8>
  <title>{username} - CompScience Hosting</title>
  <style>
    body {{ font-family: -apple-system, sans-serif; background: #f8f9fa; color: #1a1a2e; padding: 40px; }}
    h1 {{ font-size: 1.4rem; margin-bottom: 8px; }}
    h1 span {{ color: #4fc3f7; }}
    .sub {{ color: #666; font-size: .9rem; margin-bottom: 24px; }}
    table {{ border-collapse: collapse; width: 100%; max-width: 600px; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }}
    td {{ padding: 12px 20px; border-bottom: 1px solid #f0f0f0; }}
    tr:last-child td {{ border-bottom: none; }}
    a {{ color: #4fc3f7; text-decoration: none; font-weight: 600; }}
    a:hover {{ text-decoration: underline; }}
    .upload {{ margin-top: 20px; font-size: .85rem; color: #888; }}
    .upload a {{ color: #4fc3f7; }}
  </style>
</head>
<body>
  <h1>Comp<span>Science</span> - {username}</h1>
  <p class=sub>{len(files)} file(s)</p>
  <table>{rows}</table>
  <p class=upload><a href="/upload">Upload more files</a></p>
</body>
</html>"""
    index_path = os.path.join(dest_dir, 'index.html')
    with open(index_path, 'w') as f:
        f.write(html)
    os.chmod(index_path, 0o644)

@app.route('/')
@app.route('/upload')
@app.route('/upload/')
def index():
    email = request.headers.get('X-Forwarded-Email', '')
    user_header = request.headers.get('X-Auth-Request-Email', '')
    logger.info('Access attempt: X-Forwarded-Email=%r X-Auth-Request-Email=%r remote=%s path=%s',
                email, user_header, request.remote_addr, request.path)
    # Try both headers — OAuth2 proxy may use either
    effective_email = email or user_header
    username = get_username(effective_email)
    if not username:
        logger.warning('Access denied: email=%r local_part=%r not in EMAIL_MAP',
                       effective_email, effective_email.split('@')[0].lower() if effective_email else '')
        return f'<h2>Access denied</h2><p>Logged in as: <b>{effective_email or "(no email header)"}</b></p><p>Local part: <b>{effective_email.split("@")[0] if effective_email else "(none)"}</b></p><p>Not set up for hosting. Contact Martin.</p>', 403
    return open('/app/index_template.html').read().replace('USERNAME', username)

@app.route('/upload/upload', methods=['POST'])
def upload():
    email = request.headers.get('X-Forwarded-Email', '') or request.headers.get('X-Auth-Request-Email', '')
    username = get_username(email)
    if not username:
        return jsonify({'error': 'Not authorized', 'email': email}), 403
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No filename'}), 400
    filename = re.sub(r'[^\w\-_\. ]', '_', file.filename).strip()
    dest_dir = os.path.join(UPLOAD_BASE, username)
    os.makedirs(dest_dir, exist_ok=True)
    filepath = os.path.join(dest_dir, filename)
    file.save(filepath)
    os.chmod(filepath, 0o644)
    regenerate_index(dest_dir, username)
    return jsonify({'ok': True, 'filename': filename})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
