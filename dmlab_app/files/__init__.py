from .import image
from . import file


def init_app(app):
    app.register_blueprint(image.bp)
    app.register_blueprint(file.bp)
