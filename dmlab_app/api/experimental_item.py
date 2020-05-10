import logging
from datetime import datetime

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.clazz import Clazz
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

logger = logging.getLogger(__name__)

bp = Blueprint('api_experimental_item', __name__, url_prefix='/api/experimental-item')


@bp.route('/<int:experimental_item_id>', methods=['GET'])
@login_required
def handle_get_experimental_item(experimental_item_id):
    experimental_items = ExperimentalItem().query(experimental_item_id=experimental_item_id)
    data = {}
    if not experimental_items:
        msg = 'Experimental Item %d does not exists' % experimental_item_id
        error = 1
    else:
        experimental_item = experimental_items[0]
        clazzes = UserClazzRelation().query(clazz_id=experimental_item['clazz_id'], user_id=g.user['user_id'])
        if not clazzes:
            msg = 'Permission denied.'
            error = 1
        else:
            data = experimental_item
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_experimental_items():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    clazz_id = request.args.get('clazz_id', None)
    rsts = []
    user_clazz_relations = UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=clazz_id)
    for user_clazz_relation in user_clazz_relations:
        experimental_items = ExperimentalItem().query(clazz_id=user_clazz_relation['clazz_id'], limit=limit, offset=offset)
        rsts.extend(experimental_items)
    for rst in rsts:
        pre = 0
        now = 0
        last = 0
        experimental_tasks = ExperimentalTask().query(experimental_item_id=rst['experimental_item_id'])
        for experimental_task in experimental_tasks:
            if datetime.now() < experimental_task['start_time']:
                pre += 1
            elif datetime.now() < experimental_task['dead_line']:
                now += 1
            else:
                last += 1
        rst['pre'] = pre
        rst['now'] = now
        rst['last'] = last
    data = {
        'detail': rsts,
        'count': len(rsts)
    }
    return api_response('ok', 0, data)
