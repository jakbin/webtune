import os
import argparse
from pathlib import Path

from flask import Flask, render_template, send_file, jsonify, request
from eyed3 import load, log

log.setLevel("ERROR")
__version__ = '1.0.0'

app = Flask(__name__)

def convert_to_minutes_seconds(duration):
    minutes = int(duration // 60)
    seconds = duration % 60
    return f"{minutes}:{seconds:02d}"

def songs_lists(music_path):
    files = os.listdir(music_path)

    songs = []
    for file in files:
        if file.endswith('mp3'):
            try:
                audiofile = load(f"{music_path}/{file}")
                try:
                    song_name = audiofile.tag.title
                    artist = audiofile.tag.artist
                    duration = convert_to_minutes_seconds(int(audiofile.info.time_secs))
                    song_meta = {'full_name': song_name, 'artist': artist, 'duration': duration, 'file_name' : file, 'name': file.replace('.mp3', ''), 'url': file, 'cover_art_url': '../static/img/song.jpg'}
                    songs.append(song_meta)
                except AttributeError:
                    pass
            except OSError:
                pass

    return songs

def run_server(host:str=None, port:int=None, music_path:str=None):
    
    @app.route("/")
    def home():
        return render_template('index.html')

    @app.route("/songs")
    def songs_list():
        dict_songs = songs_lists(music_path)
        return jsonify(dict_songs)

    @app.route("/<string:song>.mp3", methods = ['GET'])
    def song(song):
        return send_file(f"{music_path}/{song}.mp3",as_attachment=True)

    @app.route('/deleteSong', methods=['DELETE'])
    def delete_song():
        try:
            song_name = request.json.get('songName')
            print(song_name)
            full_song_name = f"{music_path}/{song_name}"
            os.remove(full_song_name)
        
            return jsonify({'status': True, 'message': 'Song deleted successfully'})
        except FileNotFoundError:
            return jsonify({'status': False, 'message': 'File not found'})

    app.run(host=host, port=port, debug=True)

package_name = "webtune"

example_uses = '''example:
   webtune 
   webtune --dir {folder_path} --host {custom_address} --port {custom_port}
   webtune -d {folder_path} --host {custom_address} -p {custom_port}'''

def main(argv = None):
    parser = argparse.ArgumentParser(prog=package_name, description="Simple web file browser.", epilog=example_uses, formatter_class=argparse.RawDescriptionHelpFormatter)

    parser.add_argument('-d',"--dir", dest="dir", metavar="path", type=str, default=Path.cwd(), help="Music directory (default: current directory)")

    parser.add_argument("--host", dest="host", metavar="host", type=str, default="127.0.0.1", help="address to listen (default: 127.0.0.1)")

    parser.add_argument('-p',"--port", dest="port", metavar="port", type=int, default=8080, help="port to listen (default: 8080)")

    parser.add_argument('-v',"--version", action="store_true", dest="version", help="check version of webtune")

    args = parser.parse_args(argv)

    if bool(args.host) or bool(args.port) or bool(args.dir):
        return run_server(args.host, args.port, args.dir)
    elif args.version:
        return __version__
    else:
        return run_server("127.0.0.1", 8080, Path.cwd())

if __name__ == "__main__":
    raise SystemExit(main())