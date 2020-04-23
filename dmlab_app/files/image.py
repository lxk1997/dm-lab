import logging # TODO
from flask import Blueprint, abort, Response, request

from ..db.dao.dataset import Dataset
from ..filesystem import get_fs
from ..task import get_task_method

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('files_image', __name__, url_prefix='/files/image')


@bp.route('')
def handle_get_info():
    path = request.args.get('path')
    fs = get_fs()
    if not fs.exists(path):
        abort(404)
    else:
        fin = fs.open(path, 'rb')
        return Response(fin, mimetype='image/png')
