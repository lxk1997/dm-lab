from flask import g

from dmlab_app.db.dao.component import Component
from dmlab_app.task import get_task_method, evaluation_task, get_customized_task_method


def create_evaluation(item_id, task_name, params, user_id, is_async=False, customized=False):
    success = False
    if not is_async:
        if not customized:
            task_method = get_task_method(task_name)
        else:
            component = Component().query(component_name=task_name, user_id=g.user['user_id'])[0]
            task_method = get_customized_task_method(component['component_type_id'])
            params['script_key'] = component['file_key']
        success = task_method.execute(item_id=item_id, params=params)

    else:
        # return evaluation_task.delay(item_id, task_name, params, user_id)
        pass

    return success
