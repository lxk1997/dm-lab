import logging

from flask import Blueprint, request, g

from .auth import login_required
from ..db.dao.clazz import Clazz
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
        user_clazz_relation.update({'number': UserClazzRelation().get_count(clazz_id=clazz['clazz_id']), 'clazz_name': clazz['clazz_name'], 'description': clazz['description'], 'create_time': clazz['create_time']})
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
