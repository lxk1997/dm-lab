import os

from flask import Flask

import db
import api
import files
import session
import extensions

import logging
logging.basicConfig(
        level   = logging.DEBUG,
        format  = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def init_app(app):
    api.init_app(app)
    files.init_app(app)
    db.init_app(app)
    session.init_app(app)
    extensions.register_module(app)

def create_app(name=__name__):
    app = Flask(name)
    config_path = os.environ.get('APP_CONFIG')
    if config_path is None:
        config_path = 'default_config.py'
    app.config.from_pyfile(config_path)
    init_app(app)
    return app

app = create_app()