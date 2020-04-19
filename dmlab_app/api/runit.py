from dmlab_app.task import get_task_method, evaluation_task


def create_evaluation(item_id, task_name, params, user_id, is_async=False):
    success = False
    if not is_async:
        task_method = get_task_method(task_name)
        success = task_method.execute(item_id=item_id, params=params)
    else:
        # return evaluation_task.delay(item_id, task_name, params, user_id)
        pass

    return success
