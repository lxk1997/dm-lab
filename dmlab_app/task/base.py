import base64
import json
import logging
import os


logging.basicConfig(
        level   = logging.DEBUG,
        format  = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class Base(object):
    pass
