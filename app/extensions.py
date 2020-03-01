from flask import current_app
from flask_celery import Celery
from file_client import FileClient

celery = Celery()

def get_file_client():
    if not hasattr(current_app, 'file_client'):
        current_app.file_client = FileClient(host=current_app.config['FILE_CLIENT_HOST'], tmp_dir=current_app.config['FILE_CLIENT_TMP_DIR'], max_chunk_size=current_app.config['FILE_CLIENT_MAX_CHUNK_SIZE'])
    return current_app.file_client

def register_module(app):
    celery.conf.update(app.config)
    celery.init_app(app)
