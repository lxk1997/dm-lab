import json
import logging

from flask import Blueprint, request, g, url_for

from .auth import login_required
from .runit import create_evaluation
from ..db.dao.clazz import Clazz
from ..db.dao.component import Component
from ..db.dao.component_type import ComponentType
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.project import Project
from ..filesystem import get_fs
from ..task import get_task_method, get_customized_task_method
from ..utils import api_response, get_uuid

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_project', __name__, url_prefix='/api/project')


@bp.route('/create', methods=['POST'])
@login_required
def handle_create_project():
    name = request.form['name']
    experimental_item_id = request.form['experimental_item_id']
    experimental_task_id = request.form['experimental_task_id']
    clazz_id = request.form['clazz_id']
    clazzes = Clazz().query(clazz_id=clazz_id)
    if not clazzes:
        msg = 'Clazz %d does not exists.' % clazz_id
        error = 1
        return api_response(msg, error)
    experimental_items = ExperimentalItem().query(experimental_item_id=experimental_item_id, clazz_id=clazz_id)
    if not clazzes:
        msg = 'Experimental Item %d does not exists.' % experimental_item_id
        error = 1
        return api_response(msg, error)
    experimental_tasks = ExperimentalTask().query(experimental_item_id=experimental_item_id, clazz_id=clazz_id, experimental_task_id=experimental_task_id)
    if not clazzes:
        msg = 'Experimental Task %d does not exists.' % experimental_task_id
        error = 1
        return api_response(msg, error)
    projects = Project().query(project_name=name, user_id=g.user['user_id'])
    if projects:
        msg = 'Project Name has been exists.'
        error = 1
        return api_response(msg, error)
    p_id = Project().create(project_name=name, clazz_id=clazz_id, experimental_item_id=experimental_item_id, experimental_task_id=experimental_task_id, user_id=g.user['user_id'])
    if p_id == -1:
        msg = 'Invalid Params.'
        error = 1
    else:
        msg = 'ok'
        error = 0
    return api_response(msg, error)


@bp.route('', methods=['GET'])
@login_required
def handle_get_projects():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    projects = Project().query(user_id=g.user['user_id'], limit=limit, offset=offset)
    data = {
        'detail': projects,
        'count': len(projects)
    }
    return api_response('ok', 0, data)


@bp.route('/<int:project_id>', methods=['GET'])
@login_required
def handle_get_project(project_id):
    projects = Project().query(user_id=g.user['user_id'], project_id=project_id)
    if not projects:
        msg = 'Project %d does not exists.' % project_id
        error = 1
        return api_response(msg, error)
    return api_response('ok', 0, projects[0])
