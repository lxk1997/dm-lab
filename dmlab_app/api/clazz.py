import datetime
import logging

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.clazz import Clazz
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.report import Report
from ..db.dao.user import User
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_clazz', __name__, url_prefix='/api/clazz')


@bp.route('/join', methods=['POST'])
@login_required
def handle_join_clazz():
    invite_code = request.form['invite_code']
    data = {}
    clazzes = Clazz().query(invite_code=invite_code)
    if not clazzes:
        msg = 'Class does not exists.'
        error = 1
    else:
        clazz = clazzes[0]
        user_clazz_relations = UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=clazz['clazz_id'])
        if user_clazz_relations:
            msg = 'You has been in this class.'
            error = 1
        else:
            class_id = UserClazzRelation().create(user_id=g.user['user_id'], clazz_id=clazz['clazz_id'])
            if class_id != -1:
                msg = 'ok'
                error = 0
                data = {'class_id': class_id}
            else:
                msg = 'fail'
                error = 1
    return api_response(msg, error, data)


@bp.route('/<int:clazz_id>', methods=['GET'])
@login_required
def handle_get_clazz(clazz_id):
    clazzes = Clazz().query(clazz_id=clazz_id)
    data = {}
    if not len(clazzes):
        msg = 'Class %d does not exists' % clazz_id
        error = 1
    else:
        clazz = clazzes[0]
        user_clazz_relations = UserClazzRelation().query(clazz_id=clazz_id, user_id=g.user['user_id'])
        if not user_clazz_relations:
            msg = 'Permission denied.'
            error = 1
        else:
            user_clazz_relations = UserClazzRelation().query(clazz_id=clazz_id)
            clazz['students'] = user_clazz_relations
            data['detail'] = clazz
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_clazzes():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    user_clazz_relations = UserClazzRelation().query(user_id=g.user['user_id'], limit=limit, offset=offset)
    for user_clazz_relation in user_clazz_relations:
        clazz = Clazz().query(clazz_id=user_clazz_relation['clazz_id'])[0]
        user_clazz_relation.update({'number': UserClazzRelation().get_count(clazz_id=clazz['clazz_id']), 'clazz_name': clazz['clazz_name'], 'description': clazz['description'], 'teacher_name': clazz['teacher_name'], 'create_time': clazz['create_time']})
   # map(lambda clazz: clazz.update({'number': UserClazzRelation().get_count(clazz_id=clazz['clazz_id'])}), clazzes)
    count = UserClazzRelation().get_count(user_id=g.user['user_id'])
    msg = 'ok'
    error = 0
    data = dict()
    data['detail'] = user_clazz_relations
    data['count'] = count
    return api_response(msg, error, data)


@bp.route('/<int:clazz_id>', methods=['DELETE'])
@login_required
def handle_delete_clazz(clazz_id):
    clazzes = Clazz().query(clazz_id=clazz_id)
    data = {}
    if not clazzes:
        msg = 'Class %s does not exists' % clazz_id
        error = 1
    else:
        clazz = clazzes[0]
        user_clazz_relations = UserClazzRelation().query(clazz_id=clazz_id, user_id=g.user['user_id'])
        if not user_clazz_relations:
            msg = 'You are not join in this class.'
            error = 1
        else:
            UserClazzRelation().delete(user_clazz_relations[0]['user_clazz_relation_id'])
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)

@bp.route('/<int:clazz_id>/leaderboard', methods=['GET'])
@login_required
def handle_get_clazz_leaderboard(clazz_id):
    experimental_tasks = ExperimentalTask().query(clazz_id=clazz_id)
    mp = {}
    cnt = {}
    count = 0
    for experimental_task in experimental_tasks:
        name_mp = {}
        if datetime.datetime.now() < experimental_task['start_time']:
            continue
        else:
            count += 1
            reports = Report().query(experimental_task_id=experimental_task['experimental_task_id'])
            for report in reports:
                if name_mp.get(report['user_id']):
                    continue
                else:
                    name_mp[report['user_id']] = 1
                if report['score'] is None or report['score'] == '':
                    report['score'] = 0
                if mp.get(report['user_id']):
                    mp[report['user_id']] += report['score']
                else:
                    mp[report['user_id']] = report['score']
                if cnt.get(report['user_id']):
                    cnt[report['user_id']] += 1
                else:
                    cnt[report['user_id']] = 1

    data = []
    mp = sorted(mp.items(), key=lambda x: x[1], reverse=True)
    last_score = 0
    cur = 1
    rank = 1
    for idx, item in enumerate(mp):
        if idx == 0:
            last_score = item[1]
        if item[1] < last_score:
            last_score = item[1]
            rank = cur
        cur_data = {'user_id': item[0], 'degree': '%d/%d' % (cnt[item[0]], count), 'rank': rank, 'score': round(item[1], 2), 'user_name': User().query(user_id=item[0])[0]['user_name']}
        data.append(cur_data)
        cur += 1
    data = {'detail': data}
    return api_response('ok', 0, data)
