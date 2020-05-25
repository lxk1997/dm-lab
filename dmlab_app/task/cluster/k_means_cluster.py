# coding=utf-8
import json
import logging
import os

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from flask import url_for
from sklearn import cluster, metrics
from sklearn.manifold import TSNE

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

colors = ['r.', 'g.', 'b.', 'y.', 'k.', 'c.', 'b.', 'm.',
          'rs', 'gs', 'bs', 'ys', 'ks', 'cs', 'bs', 'ms',
          'rd', 'gd', 'bd', 'yd', 'kd', 'cd', 'bd', 'md',
          'rx', 'gx', 'bx', 'yx', 'kx', 'cx', 'bx', 'mx']


class KMeansCluster(Base):
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
        if success:
            evaluation = Evaluation().query(item_id=params['parent_id'])[0]
            evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                     file_path='outputs/data.json')
            if evaluation_file:
                parent_data_content = file_client.download(evaluation_file[0]['file_key'])
                data_content = json.loads(parent_data_content)
                try:
                    feature_rsts = self._get_feature(data_content, selected_columns)
                    dt_model = cluster.KMeans(n_clusters=numeric(params.get('n_clusters')),
                                              init=numeric(params.get('init')),
                                              n_init=numeric(params.get('n_init')),
                                              max_iter=numeric(params.get('max_iter')),
                                              tol=numeric(params.get('tol')),
                                              precompute_distances=numeric(params.get('precompute_distances')),
                                              algorithm=numeric(params.get('algorithm')),
                                              random_state=numeric(params.get('random_state'))
                                                          )
                    dt_model.fit(feature_rsts['content'])
                    merge_content = []
                    for idx, content in enumerate(feature_rsts['content']):
                        new_content = content + [dt_model.labels_[idx]]
                        merge_content.append(new_content)
                    data = {'headers': feature_rsts['headers'] + ['pred'],
                            'content': merge_content}
                    with fs.open(data_path, 'w') as fout:
                        json.dump(data, fout, indent=2, cls=NpEncoder, ensure_ascii=False)

                    tsne = TSNE(n_components=2, init='random', random_state=177).fit(feature_rsts['content'])
                    df = pd.DataFrame(tsne.embedding_)
                    df['labels'] = dt_model.labels_
                    plt.figure(figsize=(6.0, 4.0))
                    plt.style.use('ggplot')
                    for idx in range(numeric(params.get('n_clusters'))):
                        d = df[df['labels'] == idx]
                        plt.plot(d[0], d[1], colors[idx])
                    plt.title('Overview')
                    plt.tight_layout()
                    plt.savefig(fs.abs_path(overview_png), bbox_inches='tight')

                    silhouette_score = metrics.silhouette_score(feature_rsts['content'], dt_model.labels_)
                    calinski_harabaz_score = metrics.calinski_harabaz_score(feature_rsts['content'], dt_model.labels_)
                    json_data = {
                        'silhouette_score': silhouette_score,
                        'calinski_harabaz_score': calinski_harabaz_score,
                        'num_gt': len(feature_rsts['content'])
                    }
                    with fs.open(result_path, 'w') as fout:
                        json.dump(json_data, fout, indent=2, ensure_ascii=False)

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
            datau.set_header(['轮廓系数', 'CH', 'Num GT'])
            datau.set_content([[round(json_report['silhouette_score'], 4), round(json_report['calinski_harabaz_score'], 4),
                                json_report['num_gt']]])
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
            score_content = 'Silhouette: %s,CH: %s' % (
                round(json_report['silhouette_score'], 2), round(json_report['calinski_harabaz_score'], 2))
        return score_content

    def calc_score(self, score_field=None, item_id=None, cnt=None, time_value=None):
        return None
