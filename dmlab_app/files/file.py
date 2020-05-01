import logging # TODO
import os

from flask import Blueprint, abort, Response, request, make_response, send_from_directory

from ..filesystem import get_fs

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('files_file', __name__, url_prefix='/files/file')


@bp.route('')
def handle_get_info():
    path = request.args.get('path')
    fs = get_fs()
    if not fs.exists(path):
        abort(404)
    else:
        directory = fs.abs_path(fs.dirname(path))
        filename = os.path.basename(path)
        print(directory)
        print(filename)
        response = make_response(send_from_directory(directory, filename, as_attachment=True))
        response.headers["Content-Disposition"] = "attachment; filename={}".format(filename.encode().decode('latin-1'))
        return response
