# coding=utf-8
import datetime
import logging

import matplotlib
from flask import g

from ..base import Base
from ...db.dao.component import Component
from ...db.dao.experimental_task import ExperimentalTask
from ...db.dao.report import Report
from ...filesystem import get_fs

matplotlib.use('Agg')

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ReportUpload(Base):

    menu_info_names = [{'name': '删除'},
                       {'name': '提交实验结果'}]

    evaluation_info_names = [{'name': 'log', 'type': 'text'}]

    def _get_evaluation_dir(self, evaluation_id):
        return 'evaluations/%s' % evaluation_id

    def _check_valid_params(self, logger, params=None):
        if not params:
            logger.exception('params is None')
            return False
        elif not params.get('parent_id'):
            logger.exception('params has no attribute name "parent_id"')
            return False
        elif not params.get('clazz_id'):
            logger.exception('params has no attribute name "clazz_id"')
            return False
        elif not params.get('experimental_item_id'):
            logger.exception('params has no attribute name "experimental_item_id"')
            return False
        elif not params.get('experimental_task_id'):
            logger.exception('params has no attribute name "experimental_task_id"')
            return False
        elif not params.get('parent_task_name'):
            logger.exception('params has no attribute name "parent_task_name"')
            return False
        else:
            return True

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
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        content = params.get('content')
        file_key = params.get('file_key')
        parent_id = params['parent_id']
        parent_task_name = params['parent_task_name']
        clazz_id = params['clazz_id']
        experimental_item_id = params['experimental_item_id']
        experimental_task_id = params['experimental_task_id']
        from dmlab_app.task import get_task_method, get_customized_task_method
        task_method = get_task_method(parent_task_name)
        if not task_method:
            component = Component().query(component_name=parent_task_name, user_id=g.user['user_id'])[0]
            task_method = get_customized_task_method(component['component_type_id'])
        if success:
            experimental_task = ExperimentalTask().query(experimental_task_id=experimental_task_id)[0]
            score_field = experimental_task['score_field']
            reports = Report().query(user_id=g.user['user_id'], experimental_task_id=experimental_task_id)
            time_value = (experimental_task['dead_line'] - datetime.datetime.now()) / (experimental_task['dead_line'] - experimental_task['start_time'])
            score = task_method.calc_score(score_field, parent_id, len(reports), time_value)
            score_content = task_method.get_score(parent_id)
            Report().create(user_id=g.user['user_id'], experimental_task_id=experimental_task_id, task_name=parent_task_name, data_id=parent_id, content=content, file_key=file_key,score_content=score_content, score=score)
        logger.removeHandler(fh)
        return success

    def get_evaluation_info_list(self, item_id, info_name, config=None, limit=None, offset=None):
        assert info_name in map(lambda info_type: info_type['name'], self.evaluation_info_names)
        if info_name == 'data':
            return self._get_evaluation_data(item_id, limit=limit, offset=offset)
        elif info_name == 'log':
            return self._get_evaluation_log(item_id, limit=limit, offset=offset)
        elif info_name == 'report':
            return self._get_evaluation_report(item_id, limit=limit, offset=offset)
        else:
            raise NotImplementedError

    def _get_evaluation_data(self, item_id, limit=None, offset=None):
        return None, None, None

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

    def _get_evaluation_report(self, item_id, limit=None, offset=None):
        return None, None, None

    def get_score(self, item_id):
        return ''


