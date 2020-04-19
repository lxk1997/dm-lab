# coding=utf-8
import logging

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

logger = logging.getLogger(__name__)

bp = Blueprint('api_experimental_task', __name__, url_prefix='/api/experimental-task')


@bp.route('/<int:experimental_task_id>', methods=['GET'])
@login_required
def handle_get_experimental_task(experimental_task_id):
    experimental_tasks = ExperimentalTask().query(experimental_task_id=experimental_task_id)
    data = {}
    if not experimental_tasks:
        msg = 'Experimental Task %d does not exists' % experimental_task_id
        error = 1
    else:
        experimental_task = experimental_tasks[0]
        if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_task['clazz_id']):
            msg = 'Permission denied.'
            error = 1
        else:
            data = experimental_task
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_experimental_tasks():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    experimental_item_id = request.args.get('experimental_item_id')
    experimental_tasks = ExperimentalTask().query(experimental_item_id=experimental_item_id, limit=limit, offset=offset)
    for experimental_task in experimental_tasks:
        experimental_task['status'] = '未开始'
    count = 1
    data = {
        'detail': experimental_tasks,
        'count': count
    }
    return api_response('ok', 0, data)