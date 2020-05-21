import functools
import logging

from flask import Blueprint, request, session, g
from werkzeug.security import check_password_hash, generate_password_hash

from .auth import login_required
from ..db.dao.evaluation import Evaluation
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.report import Report
from ..db.dao.user import User
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_evaluation', __name__, url_prefix='/api/evaluation')


@bp.route('', methods=['GET'])
@login_required
def handle_get_evaluations():
    evaluations = Evaluation().query(limit=1024)
    data = {'detail': evaluations}
    return api_response('ok', 0, data)
