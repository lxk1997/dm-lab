import logging  # TODO

from flask import Blueprint

from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('', methods=['GET'])
def handle_api():
    msg = 'ok'
    error = 0
    data = {}
    return api_response(msg, error, data)

