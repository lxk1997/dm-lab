import logging

from flask import Blueprint, request

from .auth import login_required
from ..db.dao.component_type import ComponentType
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_component_type', __name__, url_prefix='/api/component_type')


@bp.route('', methods=['GET'])
@login_required
def handle_get_component_types():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    component_types = ComponentType().query(limit=limit, offset=offset)
    data = {
        'detail': component_types,
        'count': len(component_types)
    }
    return api_response('ok', 0, data)
