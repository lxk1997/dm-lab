from .import image


def init_app(app):
    app.register_blueprint(image.bp)
