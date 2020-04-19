from dmlab_app.task import get_task_method
#from celery_app import celery


#@celery.task(bind=True)
def evaluation_task(self, item_id, task_name, params, user_id):
    status = 'fail'
    try:
        task_method = get_task_method(task_name)
        success = task_method.execute(item_id, params)
        if success:
            status = 'success'
        else:
            status = 'fail'
    except:
        pass
    return status

