import logging  # TODO
from io import BytesIO

from flask import Blueprint, Response, request

from ..extensions import get_file_client

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('files_image', __name__, url_prefix='/files/image')


@bp.route('')
def handle_get_info():
    path = request.args.get('path')
    file_client = get_file_client()
    content = file_client.download(path)
    return Response(BytesIO(content), mimetype='image/png')
