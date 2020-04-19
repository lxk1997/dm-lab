import logging
import threading
import json
import multiprocessing
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
