from dmlab_app import create_app
from celery import Celery

def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
#        backend=dmlab_app.config['CELERY_RESULT_BACKEND']
        )

    celery.conf.update(app.config)
    Taskbase=celery.Task

    class ContextTask(Taskbase):
        abstract=True

        def __call__(self,*args,**kwargs):
            with app.app_context():
                return Taskbase.__call__(self,*args,**kwargs)

    celery.Task=ContextTask
    return celery

web_app = create_app(__name__)
web_app.app_context().push()
celery = make_celery(web_app)
