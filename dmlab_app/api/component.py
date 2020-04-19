import json
import logging

from flask import Blueprint, request, g, url_for

from .auth import login_required
from .runit import create_evaluation
from ..task import get_task_method
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_component', __name__, url_prefix='/api/component')


@bp.route('', methods=['POST'])
@login_required
def handle_run_component():
    item_id = request.form['item_id']
    task_name = request.form['task_name']
    params = request.form['params']
    params = json.loads(params)
    success = create_evaluation(item_id, task_name, params, g.user['user_id'])
    return api_response('', success is False)


@bp.route('/<string:task_name>/<string:item_id>/<string:info_name>', methods=['GET'])
def handle_get_info_list(task_name, item_id, info_name):
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    config = request.args.get('config', None)
    config = json.loads(config) if config else None
    task_method = get_task_method(task_name)
    info_list, count, others = task_method.get_evaluation_info_list(item_id, info_name, config, limit, offset)
    map(lambda info: info.update({'url': url_for('api_component.handle_get_info', task_name=task_name, item_id=item_id, info_name=info_name, info_id=info['id'], config=json.dumps(config) if config else None)}), info_list)
    data = {'detail': info_list,
            'count': count,
            'others': others}
    if count:
        msg = 'ok'
        error = 0
    else:
        msg = 'The component`s log does not exists.'
        error = 1
    return api_response(msg, error, data)


@bp.route('/<string:task_name>/<string:item_id>/<string:info_name>/<int:info_id>', methods=['GET'])
def handle_get_info(task_name, item_id, info_name, info_id):
    config = request.args.get('config', None)
    config = json.loads(config) if config else None
    task_method = get_task_method(task_name)
    info_list = task_method.get_evaluation_info_list(item_id=item_id, info_name=info_name, config=config, limit=1, offset=info_id - 1)
    if not len(info_list):
        msg = 'Component %s does not have %s/%d' % (item_id, info_name, info_id)
        error = 1
        data = {}
    else:
        data = info_list[0]
        error = 0
        msg = 'ok'
    return api_response(msg, error, data)

