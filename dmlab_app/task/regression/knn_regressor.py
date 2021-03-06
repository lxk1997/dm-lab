# coding=utf-8
import json
import logging
import os

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from flask import url_for
from sklearn import metrics
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor

from ..base import Base
from ..dataset_utils import DatasetUtils
from ...db import get_db
from ...db.dao.evaluation import Evaluation
from ...db.dao.evaluation_file import EvaluationFile
from ...db.models import EvaluationFileModel
from ...extensions import get_file_client
from ...filesystem import get_fs
from ...utils import NpEncoder, numeric

matplotlib.use('Agg')

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class KNNRegressor(Base):
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
        overview_png = fs.join(evaluation_output_dir, 'overview.png')
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        selected_columns = params['selected_columns']
        target_column = params['target_column']
        if success:
            evaluation = Evaluation().query(item_id=params['parent_id'])[0]
            evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                     file_path='outputs/data.json')
            if evaluation_file:
                parent_data_content = file_client.download(evaluation_file[0]['file_key'])
                data_content = json.loads(parent_data_content)
                try:
                    feature_rsts = self._get_feature(data_content, selected_columns)
                    target_rsts = self._get_target(data_content, target_column)
                    feature_train, feature_test, target_train, target_test = train_test_split(feature_rsts['content'],
                                                                                              target_rsts['content'],
                                                                                              test_size=0.33,
                                                                                              random_state=42)
                    dt_model = KNeighborsRegressor(n_neighbors=numeric(params['n_neighbors']),
                                                   weights=numeric(params['weights']),
                                                   p=numeric(params['p']),
                                                   algorithm=numeric(params['algorithm']),
                                                   leaf_size=numeric(params['leaf_size']),
                                                   metric=numeric(params['metric']))
                    dt_model.fit(feature_train, target_train)
                    prediction_test = dt_model.predict(feature_test)
                    mse = metrics.mean_squared_error(target_test, prediction_test)
                    rmse = np.sqrt(metrics.mean_squared_error(target_test, prediction_test))
                    mae = metrics.mean_absolute_error(target_test, prediction_test)
                    evs = metrics.explained_variance_score(target_test, prediction_test)
                    rsquared = metrics.r2_score(target_test, prediction_test)
                    json_data = {
                        'mse': mse,
                        'rmse': rmse,
                        'mae': mae,
                        'evs': evs,
                        'rsquared': rsquared,
                        'num_gt': len(target_train)
                    }
                    with fs.open(result_path, 'w') as fout:
                        json.dump(json_data, fout, indent=2, ensure_ascii=False)
                    merge_content = []
                    for idx, content in enumerate(feature_test):
                        new_content = content + [target_test[idx], prediction_test[idx]]
                        merge_content.append(new_content)
                    data = {'headers': feature_rsts['headers'] + [target_rsts['header'], 'pred'],
                            'content': merge_content}
                    with fs.open(data_path, 'w') as fout:
                        json.dump(data, fout, indent=2, cls=NpEncoder, ensure_ascii=False)

                    X_label = [str(i) for i in range(len(feature_test))]
                    plt.figure(figsize=(6.0, 4.0))
                    plt.style.use('ggplot')
                    plt.plot(X_label, target_test, marker='.', label='Groundtruth')
                    plt.plot(X_label, prediction_test, marker='.', alpha=0.7, label='Predict')
                    if len(feature_test) > 10 and (len(feature_test) - 1) % 10 < 5:
                        plt.xticks(np.linspace(0, np.ceil(len(feature_test) / 5) * 5 - 1, 5))
                    elif len(feature_test) > 10 and (len(feature_test) - 1) % 10 > 5:
                        plt.xticks(np.linspace(0, np.ceil(len(feature_test) / 10) * 10 - 1, 10))
                    else:
                        plt.xticks(np.linspace(0, len(feature_test) - 1, len(feature_test)))
                    plt.legend(loc='lower right', borderaxespad=0., fontsize='xx-small')
                    plt.title('Fitting Model(len=%d)' % len(feature_test))
                    plt.xlabel('Index')
                    plt.ylabel('Target')
                    plt.tight_layout()

                    plt.savefig(fs.abs_path(overview_png), bbox_inches='tight')
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
        fs = get_fs()
        file_client = get_file_client()
        cur = 1
        reports = []
        evaluation = Evaluation().query(item_id=item_id)[0]
        report = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'], file_path='outputs/result.json')
        overview = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                          file_path='outputs/overview.png')
        if report:
            report_content = file_client.download(report[0]['file_key'])
            json_report = json.loads(report_content)
            datau = DatasetUtils()
            datau.set_header(['MSE', 'RMSE', 'MAE', 'EVS', 'R-Squared', 'Num GT'])
            datau.set_content([[round(json_report['mse'], 4), round(json_report['rmse'], 4),
                                round(json_report['mae'], 4), round(json_report['evs'], 4),
                                round(json_report['rsquared'], 4), json_report['num_gt']]])
            reports.append({
                'id': cur,
                'name': 'Total',
                'type': 'table',
                'data': datau.format_dict()
            })
            cur += 1

        if overview:
            reports.append({
                'id': cur,
                'name': 'Overview',
                'type': 'image',
                'data': url_for('files_image.handle_get_info', path=overview[0]['file_key'])
            })
            cur += 1
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
            score_content = 'MSE: %s,MAE: %s, R2: %s' % (
                round(json_report['mse'], 2), round(json_report['mse'], 2), round(json_report['rsquared'], 2))
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
