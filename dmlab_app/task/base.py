import base64
import json
import logging
import os


logging.basicConfig(
        level   = logging.DEBUG,
        format  = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class Base(object):

    def calc_score(self, score_field=None, item_id=None, cnt=None, time_value=None):
        return None
