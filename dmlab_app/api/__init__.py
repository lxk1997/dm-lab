from . import api
from . import auth
from . import clazz
from . import experimental_item
from . import experimental_task
from . import dataset
from . import task
from . import component


def init_app(app):
    app.register_blueprint(api.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(clazz.bp)
    app.register_blueprint(experimental_item.bp)
    app.register_blueprint(experimental_task.bp)
    app.register_blueprint(dataset.bp)
    app.register_blueprint(task.bp)
    app.register_blueprint(component.bp)
