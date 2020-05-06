import json
import logging # TODO
import os

from flask import Blueprint, request
from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin

from .auth import login_required
from ..filesystem import get_fs
from ..utils import get_uuid

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_uploader', __name__, url_prefix='/api/uploader')


@bp.route('', methods=['POST'])
@login_required
def handle_upload_chunk():
    upload_id = get_uuid()
    status = 'error'
    upload_dir = ''
    fs = get_fs()
    _file = request.files['file']
    filename = ''
    if _file and secure_filename(''.join(lazy_pinyin(_file.filename))):
        filename = ''.join(lazy_pinyin(_file.filename))
        upload_dir = 'upload/%s' % upload_id
        if not fs.isdir(upload_dir):
            fs.makedirs(upload_dir)
        fs.save(os.path.join(upload_dir, filename), _file)
        status = 'done'
    return {'name': os.path.join(upload_dir, filename), 'status': status, 'url': '', 'thumbUrl': ''}
