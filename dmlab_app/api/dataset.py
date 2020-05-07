# coding=utf-8
import logging

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.dataset import Dataset
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.project import Project
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..filesystem import get_fs
from ..task.dataset_utils import DatasetUtils
from ..utils import api_response

logger = logging.getLogger(__name__)

bp = Blueprint('api_dataset', __name__, url_prefix='/api/dataset')

@bp.route('/<int:dataset_id>', methods=['GET'])
@login_required
def handle_get_dataset(dataset_id):
    datasets = Dataset().query(dataset_id=dataset_id)
    data={}
    if not datasets:
        msg = 'Dataset %d does not exists' % dataset_id
        error = 1
    else:
        dataset = datasets[0]
        experimental_items = ExperimentalItem().query(experimental_item_id=dataset['experimental_item_id'])
        if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_items[0]['clazz_id']):
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
    datasets = Dataset().query(experimental_item_id=experimental_item['experimental_item_id'], limit=limit, offset=offset)
    count = Dataset().get_count(experimental_item_id=experimental_item['experimental_item_id'])
    data = {
        'detail': datasets,
        'count': count
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
    fs = get_fs()
    datasets = Dataset().query(dataset_id=dataset_id, limit=limit, offset=offset)
    datau = DatasetUtils(dataset_name='')
    with fs.open(datasets[0]['file_key'], 'r') as fin:
        datau.csv2obj(fin)
    data = {
        'detail': datau.format_dict(),
    }
    msg = 'ok'
    error = 0
    return api_response(msg, error, data)
