import json
import logging

from flask import Blueprint, request, g, url_for

from .auth import login_required
from .runit import create_evaluation
from ..db.dao.component import Component
from ..db.dao.component_type import ComponentType
from ..db.dao.evaluation import Evaluation
from ..filesystem import get_fs
from ..task import get_task_method, get_customized_task_method
from ..utils import api_response, get_uuid

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_component', __name__, url_prefix='/api/component')


@bp.route('/create', methods=['POST'])
@login_required
def handle_create_component():
    component_name = request.form['component_name']
    description = request.form.get('description', 'None')
    content = request.form['content']
    component_type_id = request.form['component_type_id']
    component_types = ComponentType().query(component_type_id=component_type_id)
    if not component_types:
        msg = 'Component Type does not exists.'
        error = 1
        return api_response(msg, error)
    components = Component().query(component_name=component_name, user_id=g.user['user_id'])
    if components:
        msg = 'Component Name has been exists.'
        error = 1
        return api_response(msg, error)
    fs = get_fs()
    file_name = get_uuid() + '.py'
    if not fs.exists('components'):
        fs.makedirs('components')
    with fs.open(fs.join('components', file_name), 'w') as fin:
        fin.write(content)
    c_id = Component().create(component_name=component_name, component_type_id=component_type_id, description=description, user_id=g.user['user_id'], file_key=fs.join('components', file_name))
    if c_id == -1:
        msg = 'Invalid Params.'
        error = 1
    else:
        msg = 'ok'
        error = 0
    return api_response(msg, error)


@bp.route('', methods=['GET'])
@login_required
def handle_get_components():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    component_type_id = request.args.get('component_type_id', None)
    components = Component().query(user_id=g.user['user_id'], component_type_id=component_type_id, limit=limit, offset=offset)
    data = {
        'detail': components,
        'count': len(components)
    }
    return api_response('ok', 0, data)


@bp.route('', methods=['POST'])
@login_required
def handle_run_component():
    item_id = request.form['item_id']
    task_name = request.form['task_name']
    customized = request.form.get('customized', False)
    params = request.form['params']
    params = json.loads(params)
    evaluation_id = create_evaluation(item_id, task_name, params, g.user['user_id'], customized=customized)
    if evaluation_id == -1:
        msg = 'fail'
        error = 1
        data = {}
    else:
        msg = 'ok'
        error = 0
        data = evaluation_id
    return api_response(msg, error, data)


@bp.route('/status/<int:evaluation_id>', methods=['GET'])
@login_required
def handle_get_run_status(evaluation_id):
    evaluation = Evaluation().query(evaluation_id=evaluation_id)[0]
    return api_response('ok', 0, evaluation)


@bp.route('/<string:task_name>/<string:item_id>/<string:info_name>', methods=['GET'])
def handle_get_info_list(task_name, item_id, info_name):
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    config = request.args.get('config', None)
    config = json.loads(config) if config else None
    task_method = get_task_method(task_name)
    if not task_method:
        component = Component().query(component_name=task_name, user_id=g.user['user_id'])[0]
        task_method = get_customized_task_method(component['component_type_id'])
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

