import logging
import threading
import json
import multiprocessing
import numpy as np
from flask import jsonify, copy_current_request_context

# TODO
logger = logging.getLogger(__name__)


# INF = 1000000000

def async_thread(target, *args, **kwargs):
    threading.Thread(
        target=copy_current_request_context(target),
        args=args, kwargs=kwargs).start()


def async_process(target, *args, **kwargs):
    multiprocessing.Process(
        target=copy_current_request_context(target),
        args=args, kwargs=kwargs).start()


def api_response(msg, error, data=None):
    if data is None:
        data = {}
    result = {'msg': msg,
              'error': error,
              'data': data}

    return jsonify(result)


def get_bool(value):
    if isinstance(value, bool):
        return value
    elif isinstance(value, str):
        return value.lower() not in ['', '0', 'false']
    else:
        return bool(value)


def is_json(value):
    try:
        json.loads(value)
    except:
        return False
    return True


def numeric(value=None):
    if value is None:
        return None
    if isinstance(value, str):
        if value.find('.') != -1:
            value = float(value)
        elif value.isdigit():
            value = int(value)
    return value


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)
