# coding=utf-8
import logging
from io import BytesIO

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.dataset import Dataset
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.project import Project
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..extensions import get_file_client
from ..task.dataset_utils import DatasetUtils
from ..utils import api_response

logger = logging.getLogger(__name__)

bp = Blueprint('api_dataset', __name__, url_prefix='/api/dataset')


@bp.route('/create', methods=['POST'])
@login_required
def handle_create_dataset():
    experimental_item_id = request.form['experimental_item_id']
    dataset_name = request.form['dataset_name']
    description = request.form.get('description', None)
    file_key = request.form['file']
    user_only = request.form.get('user_only', 0)
    data = {}
    experimental_items = ExperimentalItem().query(experimental_item_id=experimental_item_id)
    if not experimental_items:
        msg = 'Experimental Item %d does not exists.' % experimental_item_id
        error = 1
        return api_response(msg, error, data)
    experimental_item = experimental_items[0]
    if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_item['clazz_id']):
        msg = 'Permission denied.'
        error = 1
        return api_response(msg, error, data)
    datasets = Dataset().query(dataset_name=dataset_name,
                               experimental_item_id=experimental_item['experimental_item_id'])
    if datasets:
        msg = 'Dataset Name has been exists.'
        error = 1
    else:
        if user_only:
            dataset_id = Dataset().create(dataset_name=dataset_name,
                                          experimental_item_id=experimental_item['experimental_item_id'],
                                          description=description, file_key=file_key, user_only=1,
                                          user_id=g.user['user_id'])
        else:
            dataset_id = Dataset().create(dataset_name=dataset_name,
                                          experimental_item_id=experimental_item['experimental_item_id'],
                                          description=description, file_key=file_key)
        if dataset_id != -1:
            msg = 'ok'
            error = 0
            data = Dataset().query(dataset_id=dataset_id)
        else:
            msg = 'fail'
            error = 1
    return api_response(msg, error, data)


@bp.route('/<int:dataset_id>', methods=['GET'])
@login_required
def handle_get_dataset(dataset_id):
    datasets = Dataset().query(dataset_id=dataset_id)
    data = {}
    if not datasets:
        msg = 'Dataset %d does not exists' % dataset_id
        error = 1
    else:
        dataset = datasets[0]
        experimental_items = ExperimentalItem().query(experimental_item_id=dataset['experimental_item_id'])
        if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_items[0]['clazz_id']):
            msg = 'Permission denied.'
            error = 1
        elif dataset['user_only'] and dataset['user_id'] != g.user['user_id']:
            msg = 'Permission denied.'
            error = 1
        else:
            data = dataset
            msg = ''
            error = 0
    return api_response(msg, error, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_datasets():
    data = {}
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    user_only = request.args.get('user_only', 0)
    experimental_item_id = request.args.get('experimental_item_id', None)
    project_id = request.args.get('project_id', None)
    if project_id:
        projects = Project().query(project_id=project_id)
        if not projects:
            msg = 'Current Project does not exists.'
            error = 1
            return api_response(msg, error, data)
        experimental_item_id = projects[0]['experimental_item_id']
    if not experimental_item_id:
        msg = 'Experimental Item Id required.'
        error = 1
        return api_response(msg, error, data)
    experimental_items = ExperimentalItem().query(experimental_item_id=experimental_item_id)
    if not experimental_items:
        msg = 'Experimental Item %s does not exists.' % experimental_item_id
        error = 1
        return api_response(msg, error, data)
    experimental_item = experimental_items[0]
    if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_items[0]['clazz_id']):
        msg = 'Permission denied.'
        error = 1
        return api_response(msg, error, data)
    if user_only == '-1':
        datasets = Dataset().query(experimental_item_id=experimental_item['experimental_item_id'], user_only=1,
                                   user_id=g.user['user_id'], limit=limit, offset=offset)
        for dataset in datasets:
            dataset['user_name'] = g.user['name']
        datasets.extend(
            Dataset().query(experimental_item_id=experimental_item['experimental_item_id'], user_only=0, limit=limit,
                            offset=offset))
    elif user_only == '1':
        datasets = Dataset().query(experimental_item_id=experimental_item['experimental_item_id'], user_only=1,
                                   user_id=g.user['user_id'], limit=limit, offset=offset)
        for dataset in datasets:
            dataset['user_name'] = g.user['name']
    else:
        datasets = Dataset().query(experimental_item_id=experimental_item['experimental_item_id'], user_only=0,
                                   limit=limit, offset=offset)
    data = {
        'detail': datasets,
    }
    msg = 'ok'
    error = 0
    return api_response(msg, error, data)


@bp.route('/info', methods=['GET'])
@login_required
def handle_get_dataset_info():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    dataset_id = request.args.get('dataset_id', None)
    file_client = get_file_client()
    datasets = Dataset().query(dataset_id=dataset_id, limit=limit, offset=offset)
    datau = DatasetUtils(dataset_name='')
    datau.csv2obj(BytesIO(file_client.download((datasets[0]['file_key']))))
    data = {
        'detail': datau.format_dict(),
    }
    msg = 'ok'
    error = 0
    return api_response(msg, error, data)


@bp.route('/<int:dataset_id>', methods=['POST'])
@login_required
def handle_update_dataset(dataset_id):
    dataset_name = request.form.get('dataset_name', None)
    description = request.form.get('description', None)
    data = {}
    datasets = Dataset().query(dataset_id=dataset_id)
    if not datasets:
        msg = 'Dataset %s does not exists' % dataset_id
        error = 1
        return api_response(msg, error, data)
    dataset = datasets[0]
    experimental_item = ExperimentalItem().query(experimental_item_id=dataset['experimental_item_id'])[0]
    if not dataset['user_only'] or dataset['user_id'] != g.user['user_id']:
        msg = 'Permission denied'
        error = 1
        return api_response(msg, error, data)
    datasets = Dataset().query(dataset_name=dataset_name,
                               experimental_item_id=experimental_item['experimental_item_id'])
    if datasets:
        msg = 'Dataset Name has been exists'
        error = 1
    else:
        row = Dataset().update(dataset_id=dataset_id, dataset_name=dataset_name, description=description)
        if not row:
            msg = 'Invalid Params'
            error = 1
            success = False
        else:
            msg = 'ok'
            error = 0
            data = Dataset().query(dataset_id=dataset_id)
    return api_response(msg, error, data)


@bp.route('/<int:dataset_id>', methods=['DELETE'])
@login_required
def handle_delete_dataset(dataset_id):
    datasets = Dataset().query(dataset_id=dataset_id)
    data = {}
    if not datasets:
        msg = 'Dataset %s does not exists' % dataset_id
        error = 1
    else:
        dataset = datasets[0]
        experimental_item = ExperimentalItem().query(experimental_item_id=dataset['experimental_item_id'])[0]

        if not dataset['user_only'] or dataset['user_id'] != g.user['user_id']:
            msg = 'Permission denied'
            error = 1
        else:
            Dataset().delete(dataset_id=dataset_id)
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)
