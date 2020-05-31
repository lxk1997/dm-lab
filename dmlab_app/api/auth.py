import functools
import logging

from flask import Blueprint, request, session, g
from werkzeug.security import check_password_hash, generate_password_hash

from ..db.dao.user import User
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..db.dao.user_info import UserInfo
from ..db.models import UserInfoModel
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_auth', __name__, url_prefix='/api/auth')


def login_required(api_func):
    @functools.wraps(api_func)
    def wrapped_api(**kwargs):
        if g.user['user_id'] == 0:
            msg = 'Login required.'
            error = 2
            return api_response(msg, error)
        return api_func(**kwargs)

    return wrapped_api


@bp.route('/register', methods=['POST'])
def handle_create_user():
    school_id = request.form['school_id']
    password = request.form['password']
    email = request.form['email']
    name = request.form['name']
    sex = request.form['sex']
    grade = request.form['grade']
    major = request.form['major']
    department = request.form['department']
    clazz = request.form['clazz']
    role_id = 0
    data = {}
    users = User().query(school_id=school_id)
    if users:
        msg = 'School ID has been exists.'
        error = 1
    else:
        user_id = User().create(school_id, generate_password_hash(password), email, role_id)
        if user_id != -1:
            UserClazzRelation().create(user_id=user_id, clazz_id=1)
            UserClazzRelation().create(user_id=user_id, clazz_id=2)
            UserClazzRelation().create(user_id=user_id, clazz_id=3)
            UserInfo().create(user_id=user_id, name=name, sex=sex, grade=grade, major=major, department=department, clazz=clazz)
            msg = 'ok'
            error = 0
            data = {'user_id': user_id}
        else:
            msg = 'fail'
            error = 1
    return api_response(msg, error, data)


@bp.route('/login', methods=['POST'])
def handle_login():
    school_id = request.form['school_id']
    password = request.form['password']
    users = User().query(school_id=school_id)
    data = {}
    if not users:
        msg = 'Incorrect school ID.'
        error = 1
    else:
        user = users[0]
        if not check_password_hash(user['password'], password):
            msg = 'Invalid password.'
            error = 1
        else:
            msg = 'ok'
            error = 0
            session.clear()
            session['user_id'] = user['user_id']
            data = {'user_id': user['user_id'],
                    'school_id': user['school_id']}
    return api_response(msg, error, data)


@bp.route('/logout', methods=['GET'])
@login_required
def handle_logout():
    session.pop('user_id')
    msg = 'ok'
    error = 0
    return api_response(msg, error)


@bp.route('/info', methods=['GET'])
@login_required
def handle_get_user_info():
    user = UserInfo().query(user_id=g.user['user_id'])
    data = user[0]
    msg = 'ok'
    error = 0
    return api_response(msg, error, data)


@bp.route('/password', methods=['POST'])
@login_required
def handle_update_password():
    old_password = request.form['old_password']
    new_password = request.form['new_password']
    user = User().query(user_id=g.user['user_id'])[0]
    if not check_password_hash(user['password'], old_password):
        msg = 'Incorrect password.'
        error = 1
    else:
        row = User().update(user_id=g.user['user_id'], password=generate_password_hash(new_password))
        if row != -1:
            msg = 'ok'
            error = 0
        else:
            msg = 'Invalid Params.'
            error = 1
    return api_response(msg, error)

@bp.route('/info', methods=['POST'])
@login_required
def handle_update_user_info():
    msg = 'ok'
    error = 0
    name = request.form.get('name', None)
    email = request.form.get('email', None)
    sex = request.form.get('sex', None)
    grade = request.form.get('grade', None)
    clazz = request.form.get('clazz', None)
    department = request.form.get('department', None)
    major = request.form.get('major', None)
    row = UserInfo().update(user_id=g.user['user_id'], name=name, sex=sex, grade=grade, clazz=clazz, department=department, major=major)
    if row != -1:
        User().update(user_id=g.user['user_id'], email=email)
    else:
        msg = 'Invalid Params.'
        error = 1
    return api_response(msg, error)


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    g.user = {'user_id': 0,
              'school_id': -1,
              'name': 'GUEST'}
    if user_id is not None:
        users = UserInfo().query(user_id=user_id)
        if len(users):
            g.user = users[0]
