import functools
import logging

from flask import Blueprint, request, session, g
from werkzeug.security import check_password_hash, generate_password_hash

from .auth import login_required
from ..db.dao.report import Report
from ..db.dao.user import User
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_mine_info', __name__, url_prefix='/api/mine-info')


@bp.route('/heat-map', methods=['GET'])
@login_required
def handle_get_heat_map():
    reports = Report().query(user_id=g.user['user_id'])
    mp = {}
    for report in reports:
        create_time = report['create_time'].split(' ')[0]
        if mp.get(create_time):
            mp[create_time] += 1
        else:
            mp[create_time] = 1
    data = mp
    return api_response('ok', 0, data)
