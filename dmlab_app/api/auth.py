import functools
import logging

from flask import Blueprint, request, session, g
from werkzeug.security import check_password_hash, generate_password_hash

from ..db.dao.user import User
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
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    role_id = 0
    data = {}
    users = User().query(username=username)
    if users:
        msg = 'Username has been exists.'
        error = 1
    else:
        user_id = User().create(username, generate_password_hash(password), email, role_id)
        if user_id != -1:
            msg = 'ok'
            error = 0
            data = {'user_id': user_id}
        else:
            msg = 'fail'
            error = 1
    return api_response(msg, error, data)


@bp.route('/login', methods=['POST'])
def handle_login():
    username = request.form['username']
    password = request.form['password']
    users = User().query(username=username)
    data = {}
    if not users:
        msg = 'Incorrect username.'
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
                    'user_name': user['user_name']}
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
    data = {'user_id': g.user['user_id'], 'user_name': g.user['user_name'], 'email': g.user['email']}
    msg = 'ok'
    error = 0
    return api_response(msg, error, data)


@bp.route('/info', methods=['POST'])
@login_required
def handle_update_user_info():
    password = request.form['password']
    email = request.form['email']
    row = User().update(user_id=g.user['user_id'], password=generate_password_hash(password), email=email)
    if row:
        data = {'user_id': g.user['user_id']}
        msg = 'ok'
        error = 0
    else:
        data = {}
        msg = 'fail'
        error = 1
    return api_response(msg, error, data)


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    g.user = {'user_id': 0,
              'user_name': 'GUEST'}
    if user_id is not None:
        users = User().query(user_id=user_id)
        if len(users):
            g.user = users[0]
