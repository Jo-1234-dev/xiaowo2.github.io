import http.server
import socketserver
import socket

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    ip = get_ip()
    print(f"\n在电脑上访问: http://localhost:{PORT}")
    print(f"在手机上访问: http://{ip}:{PORT}")
    print("\n按 Ctrl+C 停止服务器")
    httpd.serve_forever()
