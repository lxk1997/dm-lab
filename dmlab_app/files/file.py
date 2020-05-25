import logging  # TODO

from flask import Blueprint, request, make_response

from ..extensions import get_file_client

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('files_file', __name__, url_prefix='/files/file')


@bp.route('')
def handle_get_info():
    path = request.args.get('path')
    file_client = get_file_client()
    content = file_client.download(path)
    response = make_response(content)
    response.headers["Content-Disposition"] = "attachment; filename={}".format('attachment'.encode().decode('latin-1'))
    return response
