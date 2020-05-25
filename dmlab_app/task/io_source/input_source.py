# coding=utf-8
import json
import logging
import os
from io import BytesIO

from ..base import Base
from ..dataset_utils import DatasetUtils
from ...db import get_db
from ...db.dao.dataset import Dataset
from ...db.dao.evaluation import Evaluation
from ...db.dao.evaluation_file import EvaluationFile
from ...db.models import EvaluationFileModel
from ...extensions import get_file_client
from ...filesystem import get_fs

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
        data_path = fs.join(evaluation_output_dir, 'data.json')
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        if success:
            dataset = Dataset().query(dataset_id=params['dataset_id'])[0]
            data_content = file_client.download(dataset['file_key'])
            if data_content:
                datau = DatasetUtils(dataset_name=dataset['dataset_name'])
                datau.csv2obj(BytesIO(data_content))
                with fs.open(data_path, 'w') as fout:
                    json.dump(datau.format_dict(), fout, indent=2, ensure_ascii=False)
                success = True
            else:
                logger.exception(Exception(dataset['file_key'] + ' is not a file'))
                success = False
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
        else:
            raise NotImplementedError

    def _get_evaluation_data(self, item_id, limit=None, offset=None):
        file_client = get_file_client()
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'], file_path='outputs/data.json')
        if evaluation_file:
            data_content = file_client.download(evaluation_file[0]['file_key'])
            datas = [{
                'id': 1,
                'name': 'data',
                'type': 'json_str',
                'data': str(data_content, encoding='utf-8')
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
        file_client = get_file_client()
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'], file_path='outputs/evaluation.log')
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

    def get_score(self, item_id):
        return ''


