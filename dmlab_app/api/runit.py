from flask import g

from dmlab_app.db.dao.evaluation import Evaluation
from dmlab_app.db.dao.project import Project
from ..task.evaluation_task import evaluation_task


def create_evaluation(item_id, task_name, params, user_id, customized=False):
    project_id = params['project_id']
    projects = Project().query(project_id=project_id)
    evaluation_id = Evaluation().create(user_id=g.user['user_id'], experimental_task_id=projects[0]['experimental_task_id'], task_name=task_name, status='pending')
    if evaluation_id != -1:
        evaluation_task.delay(evaluation_id, item_id, task_name, params, user_id, customized)
    return evaluation_id
