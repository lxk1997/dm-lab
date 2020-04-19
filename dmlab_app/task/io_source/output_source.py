# coding=utf-8
import json
import os

from ..base import Base

import logging

from ..dataset_utils import DatasetUtils
from ...db.dao.component import Component
from ...db.dao.dataset import Dataset
from ...db.dao.experimental_item import ExperimentalItem
from ...db.dao.user_clazz_relation import UserClazzRelation
from ...filesystem import get_fs, get_tmp_dir

logging.basicConfig(
        level   = logging.ERROR,
        format  = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class OutputSource(Base):
    component_id = 1
    menu_info_names = [{'name': "重命名"},
                       {'name': '删除'},
                       {'name': '全部运行'},
                       {'name': '运行到此处'},
                       {'name': '运行该节点'},
                       {'name': '从此节点运行'},
                       {'name': '查看数据'},
                       {'name': '查看日志'},
                       {'name': '数据下载'}]

    evaluation_info_names = [{'name': 'data', 'type': 'data'},
                             {'name': 'log', 'type': 'text'},
                             {'name': 'file', 'type': 'file'}]

    def _get_evaluation_dir(self, evaluation_id):
        return 'evaluations/%s' % evaluation_id

    def _check_valid_params(self, logger, params=None):
        if params and params.get('parent_id'):
            return True
        else:
            logger.exception('params has no attribute name "parent_id"')
            return False

    def execute(self, evaluation_id=None, params=None, item_id=None):
        fs = get_fs()
        evaluation_dir = self._get_evaluation_dir(item_id)
        evaluation_output_dir = fs.join(evaluation_dir, 'outputs')
        if fs.isdir(fs.join(evaluation_dir, 'outputs')):
            fs.rmtree(fs.join(evaluation_dir, 'outputs'))
        fs.makedirs(evaluation_output_dir)
        data_path = fs.join(evaluation_output_dir, 'data.json')

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s: - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S')
        log_path = fs.abs_path(fs.join(evaluation_output_dir, 'evaluation.log'))
        data_path = fs.join(evaluation_output_dir, 'data.json')
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        if success:
            par_evaluation_dir = self._get_evaluation_dir(params['parent_id'])
            par_evaluation_output_dir = fs.join(par_evaluation_dir, 'outputs')
            par_data_path = fs.join(par_evaluation_output_dir, 'data.json')
            if fs.isfile(par_data_path):
                with fs.open(par_data_path, 'r') as fin:
                    data_content = fin.read()
                with fs.open(data_path, 'w') as fout:
                    json.dump(json.loads(data_content), fout, indent=2)
            else:
                logger.exception(Exception('parent %s has no data.' % params['parent_id']))
                success = False
        logger.removeHandler(fh)
        return success

    def get_evaluation_info_list(self, item_id, info_name, config=None, limit=None, offset=None):
        assert info_name in map(lambda info_type: info_type['name'], self.evaluation_info_names)
        if info_name == 'data':
            return self._get_evaluation_data(item_id, limit=limit, offset=offset)
        elif info_name == 'log':
            return self._get_evaluation_log(item_id, limit=limit, offset=offset)
        # elif info_name == 'file':
        #     return self._get_evaluation_files(item_id, limit=limit, offset=offset)
        else:
            raise NotImplementedError

    def _get_evaluation_data(self, item_id, limit=None, offset=None):
        fs = get_fs()
        evaluation_dir = self._get_evaluation_dir(item_id)
        evaluation_output_dir = fs.join(evaluation_dir, 'outputs')
        data_path = fs.join(evaluation_output_dir, 'data.json')
        if fs.exists(data_path):
            with fs.open(data_path, 'r') as fin:
                data_content = fin.read()
            datas = [{
                'id': 1,
                'name': 'data',
                'type': 'json_str',
                'data': data_content
            }]
        else:
            datas = []
        count = len(datas)
        if limit is None:
            limit = len(datas)
        else:
            limit = int(limit)
        if offset is None:
            offset = 0
        else:
            offset = int(offset)
        return datas[offset:offset + limit], count, None

    def _get_evaluation_log(self, item_id, limit=None, offset=None):
        fs = get_fs()
        evaluation_dir = self._get_evaluation_dir(item_id)
        evaluation_output_dir = fs.join(evaluation_dir, 'outputs')
        log_path = fs.join(evaluation_output_dir, 'evaluation.log')
        if fs.exists(log_path):
            with fs.open(log_path, 'rb') as fin:
                log_content = fin.read()
            logs = [{
                'id': 1,
                'name': 'evaluation.log',
                'type': 'text',
                'data': str(log_content, encoding='utf-8')
            }]
        else:
            logs = []
        count = len(logs)
        if limit is None:
            limit = len(logs)
        else:
            limit = int(limit)
        if offset is None:
            offset = 0
        else:
            offset = int(offset)
        return logs[offset:offset + limit], count, None


