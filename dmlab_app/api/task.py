import logging # TODO
from flask import Blueprint, request

from ..task import query_task
from ..utils import api_response

bp = Blueprint('api_tasks', __name__, url_prefix='/api/tasks')

@bp.route('', methods=['GET'])
def handle_query_task():
    task_id = request.args.get('task_id', None)
    task_name = request.args.get('task_name', None)
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    tasks = query_task(task_id, task_name, limit=limit, offset=offset)
    count = len(query_task())
    data = {'detail': tasks,
            'count': count}
    error = 0
    msg = 'ok'
    return api_response(msg, error, data)

@bp.route('/<int:task_id>', methods=['GET'])
def handle_get_task(task_id):
    tasks = query_task(task_id)
    if not len(tasks):
        msg = 'Task %d does not exists' % task_id
        error = 1
        data = {}
    else:
        msg = 'ok'
        error = 0
        task = tasks[0]
        data = {'detail': task}
    return api_response(msg, error, data)