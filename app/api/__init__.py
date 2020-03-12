from . import api
from . import auth
from . import clazz


def init_app(app):
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(clazz.bp)