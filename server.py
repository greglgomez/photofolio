#!/usr/bin/env python3
"""
Simple HTTP server for the photography portfolio website.
Run this script to serve the website locally.
"""

import http.server
import socketserver
import os
import sys
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent
IMAGES_DIR = DIRECTORY / "images"

# Supported image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'}

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def do_GET(self):
        # Handle API requests
        if self.path == '/api/images':
            self.handle_images_api()
            return
        
        # Handle regular file requests
        super().do_GET()
    
    def handle_images_api(self):
        """Handle /api/images endpoint to return list of images"""
        try:
            if not IMAGES_DIR.exists():
                self.send_json_response([])
                return
            
            # Get all image files from the images directory
            image_files = []
            for file_path in IMAGES_DIR.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in IMAGE_EXTENSIONS:
                    image_files.append(file_path.name)
            
            # Sort files alphabetically
            image_files.sort()
            self.send_json_response(image_files)
            
        except Exception as e:
            print(f"Error handling images API: {e}")
            self.send_json_response([])
    
    def send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Photography Portfolio Server")
            print(f"📁 Serving from: {DIRECTORY}")
            print(f"🖼️  Images directory: {IMAGES_DIR}")
            print(f"🌐 URL: http://localhost:{PORT}")
            print(f"📱 Open the URL in your browser to view the website")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Check if images directory exists and has images
            if IMAGES_DIR.exists():
                image_count = len([f for f in IMAGES_DIR.iterdir() 
                                 if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS])
                print(f"📸 Found {image_count} images in the images folder")
            else:
                print(f"📁 Images folder not found. Create it and add your photos!")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use.")
            print(f"💡 Try a different port: python server.py --port 8001")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    # Check if port argument is provided
    if len(sys.argv) > 2 and sys.argv[1] == "--port":
        try:
            PORT = int(sys.argv[2])
        except ValueError:
            print("❌ Invalid port number")
            sys.exit(1)
    
    main()
