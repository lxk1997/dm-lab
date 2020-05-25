import json
import logging # TODO
import os

from flask import Blueprint, request
from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin

from .auth import login_required
from ..extensions import get_file_client

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_uploader', __name__, url_prefix='/api/uploader')


@bp.route('', methods=['POST'])
@login_required
def handle_upload_chunk():
    status = 'error'
    file_client = get_file_client()
    collection = file_client.get_collection()
    _file = request.files['file']
    if _file and secure_filename(''.join(lazy_pinyin(_file.filename))):
        collection.add(_file.read())
        rets = file_client.upload_collection(collection)
        collection.close()
        status = 'done'
    return {'name': rets[0].id, 'status': status, 'url': '', 'thumbUrl': ''}
