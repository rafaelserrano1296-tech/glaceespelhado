#!/usr/bin/env python3
"""
Servidor local para o site Glacê Espelhado Premium.
Serve os arquivos estáticos e faz proxy para a API da AbacatePay.

Uso: python server.py
Acesse: http://localhost:3000
"""

import json
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import mimetypes

ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne'
ABACATE_BASE = 'https://api.abacatepay.com/v2'
PORT = 3000
ROOT = Path(__file__).parent


class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} - {fmt % args}")

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def abacate_request(self, method, path, body=None):
        url = ABACATE_BASE + path
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(
            url,
            data=data,
            method=method,
            headers={
                'Authorization': f'Bearer {ABACATE_KEY}',
                'Content-Type': 'application/json',
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.status, json.loads(resp.read())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read())

    def do_POST(self):
        if self.path == '/api/pix/create':
            length = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(length))

            status, result = self.abacate_request('POST', '/transparents/create', {
                'method': 'PIX',
                'data': {
                    'amount': payload['amount'],
                    'description': 'Glacê Espelhado Premium',
                    'expiresIn': 1800,
                    'customer': {
                        'email': payload['email'],
                        'cellphone': payload.get('cellphone', ''),
                    }
                }
            })
            self.send_json(status, result)
        else:
            self.send_json(404, {'error': 'Not found'})

    def do_GET(self):
        if self.path.startswith('/api/pix/check'):
            pix_id = self.path.split('id=')[-1] if 'id=' in self.path else ''
            status, result = self.abacate_request('GET', f'/transparents/check?id={pix_id}')
            self.send_json(status, result)
            return

        # Arquivos estáticos
        url_path = self.path.split('?')[0]
        if url_path == '/':
            url_path = '/index.html'

        file_path = ROOT / url_path.lstrip('/')
        if file_path.is_file():
            mime, _ = mimetypes.guess_type(str(file_path))
            body = file_path.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mime or 'application/octet-stream')
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_json(404, {'error': 'Not found'})


if __name__ == '__main__':
    server = HTTPServer(('localhost', PORT), Handler)
    print(f'\n  Servidor rodando em http://localhost:{PORT}')
    print('  Pressione Ctrl+C para parar\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Servidor encerrado.')
