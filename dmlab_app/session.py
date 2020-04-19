from redis import Redis
from flask_session import Session

def init_app(app):
    if app.config['SESSION_TYPE'] == 'redis':
        app.config['SESSION_REDIS'] = Redis(**app.config['REDIS'])
        Session(app)
    else:
        raise NotImplementedError
