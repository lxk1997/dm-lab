from flask import g

from ..db.dao.component import Component
from ..db.dao.evaluation import Evaluation
from ..task import get_task_method, get_customized_task_method
from ..extensions import celery


@celery.task(bind=True)
def evaluation_task(self, evaluation_id, item_id, task_name, params, user_id, customized):
    success = False
    try:
        if not customized:
            task_method = get_task_method(task_name)
        else:
            component = Component().query(component_name=task_name, user_id=user_id)[0]
            print(component['component_type_id'])
            task_method = get_customized_task_method(component['component_type_id'])
            params['script_key'] = component['file_key']
        Evaluation().update(evaluation_id, status='running')
        params['user_id'] = user_id
        success = task_method.execute(evaluation_id=evaluation_id, item_id=item_id, params=params)
        if success:
            status = 'success'
        else:
            status = 'fail'
        Evaluation().update(evaluation_id, status=status)
    except:
        Evaluation().update(evaluation_id, status='fail')
    return success


