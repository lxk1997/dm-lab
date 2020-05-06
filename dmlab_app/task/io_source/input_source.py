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


class InputSource(Base):
    component_id = 1
    menu_info_names = [{'name': "重命名"},
                       {'name': '删除'},
                       {'name': '全部运行'},
                       {'name': '运行到此处'},
                       {'name': '运行该节点'},
                       {'name': '从此节点运行'},
                       {'name': '查看数据'},
                       {'name': '查看日志'}]

    evaluation_info_names = [{'name': 'data', 'type': 'data'},
                             {'name': 'log', 'type': 'text'}]

    def _get_evaluation_dir(self, evaluation_id):
        return 'evaluations/%s' % evaluation_id

    def _check_valid_params(self, logger, params=None):
        if params and params.get('dataset_id'):
            return True
        else:
            logger.exception('params has no attribute name "dataset_id"')
            return False

    def get_init_infos(self, params=None):
        assert params and params.get('user_id'), 'params is None or params has no attribute named "user_id"'
        rst = dict()
        user_clazz_relations = UserClazzRelation().query(user_id=params['user_id'])
        for user_clazz_relation in user_clazz_relations:
            experimental_items = ExperimentalItem().query(clazz_id=user_clazz_relation['clazz_id'])
            for experimental_item in experimental_items:
                datasets = Dataset().query(experimental_item_id=experimental_item['experimental_item_id'])
                experimental_item.update({'datasets': datasets})
            user_clazz_relation.update({'experimental_items', experimental_items})
        rst['detail'] = user_clazz_relations
        rst['description'] = Component().query(component_id=self.component_id)[0]['description']
        return rst

    def get_dataset_info(self, params=None):
        fs = get_fs()
        assert params and params.get('dataset_id'), 'params is None or params has no attribute named "dataset_id"'
        dataset = Dataset().query(dataset_id=params['dataset_id'])[0]
        if fs.exists(dataset['file_key']):
            fil = fs.open(dataset['file_key'])
            data = DatasetUtils(dataset_name=os.path.basename(dataset['file_key']))
            data.csv2obj(fil)
            return data.format_dict()
        else:
            raise Exception(dataset['file_key'] + ' is not a file')

    def execute(self, evaluation_id=None, params=None, item_id=None):
        fs = get_fs()
        evaluation_dir = self._get_evaluation_dir(item_id)
        evaluation_output_dir = fs.join(evaluation_dir, 'outputs')
        if fs.isdir(fs.join(evaluation_dir, 'outputs')):
            fs.rmtree(fs.join(evaluation_dir, 'outputs'))
        fs.makedirs(evaluation_output_dir)
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
            dataset = Dataset().query(dataset_id=params['dataset_id'])[0]
            if fs.exists(dataset['file_key']):
                datau = DatasetUtils(dataset_name=dataset['dataset_name'])
                with fs.open(dataset['file_key'], 'r') as fin:
                    datau.csv2obj(fin)
                with fs.open(data_path, 'w') as fout:
                    json.dump(datau.format_dict(), fout, indent=2, ensure_ascii=False)
                success = True
            else:
                logger.exception(Exception(dataset['file_key'] + ' is not a file'))
                success = False
        logger.removeHandler(fh)
        return success

    def get_evaluation_info_list(self, item_id, info_name, config=None, limit=None, offset=None):
        assert info_name in map(lambda info_type: info_type['name'], self.evaluation_info_names)
        if info_name == 'data':
            return self._get_evaluation_data(item_id, limit=limit, offset=offset)
        elif info_name == 'log':
            return self._get_evaluation_log(item_id, limit=limit, offset=offset)
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

    def get_score(self, item_id):
        return ''


