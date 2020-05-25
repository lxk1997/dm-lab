# coding=utf-8
import datetime
import logging
import os

import matplotlib
from flask import g

from ..base import Base
from ...db import get_db
from ...db.dao.component import Component
from ...db.dao.evaluation import Evaluation
from ...db.dao.evaluation_file import EvaluationFile
from ...db.dao.experimental_task import ExperimentalTask
from ...db.dao.project import Project
from ...db.dao.report import Report
from ...db.models import EvaluationFileModel
from ...extensions import get_file_client
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
        elif not params.get('project_id'):
            logger.exception('params has no attribute name "project_id"')
            return False
        elif not params.get('parent_task_name'):
            logger.exception('params has no attribute name "parent_task_name"')
            return False
        else:
            return True

    def execute(self, evaluation_id=None, params=None, item_id=None):
        fs = get_fs()
        file_client = get_file_client()
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
        project_id = params['project_id']
        project = Project().query(project_id=project_id)[0]
        experimental_task_id = project['experimental_task_id']
        from dmlab_app.task import get_task_method, get_customized_task_method
        task_method = get_task_method(parent_task_name)
        if not task_method:
            component = Component().query(component_name=parent_task_name, user_id=params['user_id'])[0]
            task_method = get_customized_task_method(component['component_type_id'])
        if success:
            experimental_task = ExperimentalTask().query(experimental_task_id=experimental_task_id)[0]
            score_field = experimental_task['score_field']
            print(params['user_id'])
            reports = Report().query(user_id=params['user_id'], experimental_task_id=experimental_task_id)
            time_value = (experimental_task['dead_line'] - datetime.datetime.now()) / (experimental_task['dead_line'] - experimental_task['start_time'])
            score = task_method.calc_score(score_field, parent_id, len(reports), time_value)
            score_content = task_method.get_score(parent_id)
            Report().create(user_id=params['user_id'], experimental_task_id=experimental_task_id, task_name=parent_task_name, data_id=parent_id, content=content, file_key=file_key,score_content=score_content, score=score)
        logger.removeHandler(fh)
        db = get_db()
        try:
            collection = file_client.get_collection()
            file_paths = list()

            for dirpath, dirnames, filenames in os.walk(fs.abs_path(evaluation_dir)):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    r_path = os.path.relpath(file_path, fs.abs_path(evaluation_dir))
                    with open(file_path, 'rb') as fin:
                        collection.add(fin.read())
                        file_paths.append(r_path)
            rets = file_client.upload_collection(collection)
            for idx, ret in enumerate(rets):
                evaluation_file = EvaluationFileModel(evaluation_id=evaluation_id,
                                                      file_path=file_paths[idx], file_key=ret.id, deleted=0)
                db.add(evaluation_file)
            collection.close()
            # os.remove(fs.abs_path(evaluation_dir))
            db.commit()
        except:
            db.rollback()
        finally:
            db.close()
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
        file_client = get_file_client()
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                 file_path='outputs/evaluation.log')
        if evaluation_file:
            log_content = file_client.download(evaluation_file[0]['file_key'])
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


