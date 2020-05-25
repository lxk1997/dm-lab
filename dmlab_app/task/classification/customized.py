# coding=utf-8
import base64
import json
import os

from flask import url_for

from ..base import Base

import logging

from ..dataset_utils import DatasetUtils
from ...db import get_db
from ...db.dao.component import Component
from ...db.dao.dataset import Dataset
from ...db.dao.evaluation import Evaluation
from ...db.dao.evaluation_file import EvaluationFile
from ...db.dao.experimental_item import ExperimentalItem
from ...db.dao.user_clazz_relation import UserClazzRelation
from ...db.models import EvaluationFileModel
from ...extensions import get_file_client
from ...filesystem import get_fs, get_tmp_dir

from sklearn.model_selection import train_test_split
from sklearn import neighbors, metrics
import pydotplus
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.ticker import MultipleLocator
import numpy as np
from ...utils import NpEncoder, numeric, create_instance, get_uuid

matplotlib.use('Agg')


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class CustomizedClassifier(Base):
    component_id = 1
    menu_info_names = [{'name': "重命名"},
                       {'name': '删除'},
                       {'name': '全部运行'},
                       {'name': '运行到此处'},
                       {'name': '运行该节点'},
                       {'name': '从此节点运行'},
                       {'name': '查看数据'},
                       {'name': '查看日志'},
                       {'name': '查看报告'}]

    evaluation_info_names = [{'name': 'data', 'type': 'data'},
                             {'name': 'log', 'type': 'text'},
                             {'name': 'report', 'type': 'general'}]

    def _get_evaluation_dir(self, evaluation_id):
        return 'evaluations/%s' % evaluation_id

    def _check_valid_params(self, logger, params=None):
        if not params:
            logger.exception('params is None')
            return False
        elif not params.get('parent_id'):
            logger.exception('params has no attribute name "parent_id"')
            return False
        elif not params.get('selected_columns'):
            logger.exception('params has no attribute name "selected_columns"')
            return False
        elif not params.get('target_column'):
            logger.exception('params has no attribute name "target_column"')
            return False
        elif not params.get('script_key'):
            logger.exception('params has no attribute name "script_key"')
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
        result_path = fs.join(evaluation_output_dir, 'result.json')
        data_path = fs.join(evaluation_output_dir, 'data.json')
        confusion_matrix_png = fs.join(evaluation_output_dir, 'confusion_matrix.png')
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        selected_columns = params['selected_columns']
        target_column = params['target_column']
        script_key = params['script_key']
        par_evaluation_dir = self._get_evaluation_dir(params['parent_id'])
        if success:
            evaluation = Evaluation().query(item_id=params['parent_id'])[0]
            evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                     file_path='outputs/data.json')
            if evaluation_file:
                parent_data_content = file_client.download(evaluation_file[0]['file_key'])
                data_content = json.loads(parent_data_content)
                try:
                    model_params = params.get('params', {})
                    if isinstance(model_params, str):
                        model_params = json.loads(model_params)
                    feature_rsts = self._get_feature(data_content, selected_columns)
                    target_rsts = self._get_target(data_content, target_column)
                    feature_train, feature_test, target_train, target_test = train_test_split(feature_rsts['content'],
                                                                                              target_rsts['content'],
                                                                                              test_size=0.33,
                                                                                              random_state=42)
                    script_content = file_client.download(script_key)
                    if not fs.exists('components'):
                        fs.makedirs('components')
                    components_path = 'components/%s.py' % get_uuid()
                    with fs.open(components_path, 'w') as fin:
                        fin.write(str(script_content, encoding='utf-8'))
                    class_instance = create_instance(os.path.basename(fs.abs_path(components_path)).split('.')[0], 'Solver')
                    class_instance.fit(feature_train, target_train, model_params)
                    prediction_test = class_instance.predict(feature_test)
                    acc = metrics.accuracy_score(target_test, prediction_test)
                    rec = metrics.recall_score(target_test, prediction_test, average='macro')
                    pre = metrics.precision_score(target_test, prediction_test, average='macro')
                    #ap = metrics.average_precision_score(target_test, prediction_test)
                    f1_score = metrics.f1_score(target_test, prediction_test, average='macro')
                    report = metrics.classification_report(target_test, prediction_test, target_names=target_rsts['names'])
                    json_data = {
                        'acc': acc,
                        'rec': rec,
                        'pre': pre,
                        #'ap': ap,
                        'f1_score': f1_score,
                        'num_gt': len(target_train),
                        'report': report
                    }
                    with fs.open(result_path, 'w') as fout:
                        json.dump(json_data, fout, indent=2, ensure_ascii=False)
                    merge_content = []
                    for idx, content in enumerate(feature_test):
                        new_content = content + [target_test[idx], prediction_test[idx]]
                        merge_content.append(new_content)
                    data = {'headers': feature_rsts['headers'] + [target_rsts['header'], 'pred'], 'content': merge_content}
                    with fs.open(data_path, 'w') as fout:
                        json.dump(data, fout, indent=2, cls=NpEncoder, ensure_ascii=False)

                    matrix = metrics.confusion_matrix(target_test, prediction_test)
                    matrix = matrix.astype(np.float)
                    num_gts = matrix.sum(axis=1)
                    num_prs = matrix.sum(axis=0)
                    normed_matrix = matrix / num_gts.reshape(-1, 1)
                    fig = plt.figure(figsize=(14, 14))
                    ax = fig.add_subplot(111)
                    cax = ax.matshow(normed_matrix)
                    fig.colorbar(cax)
                    ax.xaxis.set_major_locator(MultipleLocator(1))
                    ax.yaxis.set_major_locator(MultipleLocator(1))
                    for row in range(matrix.shape[0]):
                        for col in range(matrix.shape[1]):
                            if np.isnan(normed_matrix[row, col]):
                                ax.text(col, row, 'NaN', va='center', ha='center', fontsize=12)
                            else:
                                ax.text(col, row, '%.1f%%' % (normed_matrix[row, col] * 100), va='center', ha='center',
                                        fontsize=12)
                    classes_with_num_gts = list(map(lambda c_n: '%s(%d)' % (c_n[0], c_n[1]), zip(target_rsts['names'], num_gts)))
                    classes_with_num_prs = list(map(lambda c_n: '%s(%d)' % (c_n[0], c_n[1]), zip(target_rsts['names'], num_prs)))
                    ax.set_xticklabels([None] + classes_with_num_prs, rotation=45)
                    ax.set_yticklabels([None] + classes_with_num_gts)
                    ax.set_xlabel('Predict', fontdict={'fontsize': 20})
                    ax.set_ylabel('Groundtruth', fontdict={'fontsize': 20})
                    ax.set_title('Confusion Matrix', pad=50)

                    plt.savefig(fs.abs_path(confusion_matrix_png), bbox_inches='tight')
                    plt.close(fig)
                except Exception as e:
                    logger.exception(e)
                    success = False
            else:
                logger.exception(Exception('parent %s has no data.' % params['parent_id']))
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
        elif info_name == 'report':
            return self._get_evaluation_report(item_id, limit=limit, offset=offset)
        else:
            raise NotImplementedError

    def _get_evaluation_data(self, item_id, limit=None, offset=None):
        file_client = get_file_client()
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                 file_path='outputs/data.json')
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
        file_client = get_file_client()
        cur = 1
        reports = []
        evaluation = Evaluation().query(item_id=item_id)[0]
        report = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'], file_path='outputs/result.json')
        confusion_matrix = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                  file_path='outputs/confusion_matrix.png')
        if report:
            report_content = file_client.download(report[0]['file_key'])
            json_report = json.loads(report_content)
            datau = DatasetUtils()
            datau.set_header(['Accuracy', 'mean Precision', 'mean Recall', 'F1', 'Num GT'])
            datau.set_content([[round(json_report['acc'], 4), round(json_report['pre'], 4), round(json_report['rec'], 4), round(json_report['f1_score'], 4), json_report['num_gt']]])
            reports.append({
                'id': cur,
                'name': 'Total',
                'type': 'table',
                'data': datau.format_dict()
            })
            cur += 1

            datau.set_header(['Category', 'Precision', 'Recall', 'F1', 'Num PRED'])
            contents = []
            for idx, row in enumerate(json_report['report'].replace('\n\n', '\n').splitlines()):
                content = []
                if idx == 0:
                    continue
                else:
                    str_splits = row.split(' ')
                    gap = False
                    for s in str_splits:
                        if len(s):
                            if gap:
                                gap = False
                                continue
                            if s == 'accuracy':
                                content.extend([s, '', ''])
                            elif s == 'macro':
                                content.append('macro avg')
                                gap = True
                            elif s == 'weighted':
                                content.append('weighted avg')
                                gap = True
                            else:
                                content.append(s)
                contents.append(content)
            datau.set_content(contents)
            reports.append({
                'id': cur,
                'name': 'Category',
                'type': 'table',
                'data': datau.format_dict()
            })
            cur += 1
        if confusion_matrix:
            reports.append({
                'id': cur,
                'name': 'Confusion Matrix',
                'type': 'image',
                'data': url_for('files_image.handle_get_info', path=confusion_matrix[0]['file_key'])
            })
        count = len(reports)
        if limit is None:
            limit = len(reports)
        else:
            limit = int(limit)
        if offset is None:
            offset = 0
        else:
            offset = int(offset)
        return reports[offset:offset + limit], count, None

    def _get_feature(self, data, selected_columns):
        selected_columns_idx = []
        columns = []
        for idx, item in enumerate(data['headers']):
            if item in selected_columns:
                selected_columns_idx.append(idx)
                columns.append(item)
        rsts = []
        for idx, item in enumerate(data['content']):
            rst = []
            for idx1, item1 in enumerate(item):
                if idx1 in selected_columns_idx:
                    item1 = numeric(item1)
                    rst.append(item1)
            rsts.append(rst)
        rsts = {'headers': columns, 'content': rsts}
        return rsts

    def _get_target(self, data, target_column):
        target_column_idx = 0
        mp = {}
        names = []
        cur = 1
        column = ''
        for idx, item in enumerate(data['headers']):
            if item == target_column:
                target_column_idx = idx
                column = item
        rsts = []
        for idx, item in enumerate(data['content']):
            val = item[target_column_idx]
            if mp.get(val):
                rsts.append(mp.get(val))
            else:
                mp[val] = cur
                cur += 1
                names.append(val)
                rsts.append(mp.get(val))
        rsts = {'header': column, 'content': rsts, 'names': names}
        return rsts

    def get_score(self, item_id):
        score_content = ''
        file_client = get_file_client()
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                 file_path='outputs/result.json')
        if evaluation_file:
            report_content = file_client.download(evaluation_file[0]['file_key'])
            json_report = json.loads(report_content)
            score_content = 'Acc: %s,AP: %s, AR: %s' % (round(json_report['acc'], 2), round(json_report['pre'], 2), round(json_report['rec'], 2))
        return score_content

    def calc_score(self, score_field=None, item_id=None, cnt=None, time_value=None):
        if not score_field or not item_id:
            return None
        else:
            file_client = get_file_client()
            evaluation = Evaluation().query(item_id=item_id)[0]
            evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                     file_path='outputs/result.json')
            if evaluation_file:
                report_content = file_client.download(evaluation_file[0]['file_key'])
                json_report = json.loads(report_content)
                target = score_field['algorithm_target']
                if json_report.get(target):
                    cur_score = json_report.get(target) * 100.0
                    finally_score = round((cur_score * score_field['result_ratio'] / 100.0 + ((cur_score * (100 - score_field['result_ratio']) / 100.0) ** (time_value))) * ((score_field['count_ratio'] / 100) ** (cnt+1)), 2)
                    return finally_score
                else:
                    return 0
