import api
import auth


def init_app(app):
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp)