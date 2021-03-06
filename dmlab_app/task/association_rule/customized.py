# coding=utf-8
import json
import logging
import os

import matplotlib
from efficient_apriori import apriori

from ..base import Base
from ..dataset_utils import DatasetUtils
from ...db import get_db
from ...db.dao.evaluation import Evaluation
from ...db.dao.evaluation_file import EvaluationFile
from ...db.models import EvaluationFileModel
from ...extensions import get_file_client
from ...filesystem import get_fs
from ...utils import NpEncoder, numeric, create_instance, get_uuid

matplotlib.use('Agg')


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class CustomizedAssociationRule(Base):
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
        fh = logging.FileHandler(log_path)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        success = self._check_valid_params(logger, params)
        if success:
            script_key = params['script_key']
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
                    content = self._format_content(data_content)
                    script_content = file_client.download(script_key)
                    if not fs.exists('components'):
                        fs.makedirs('components')
                    components_path = 'components/%s.py' % get_uuid()
                    with fs.open(components_path, 'w') as fin:
                        fin.write(script_content)
                    class_instance = create_instance(os.path.basename(fs.abs_path(components_path)).split('.')[0],
                                                     'Solver')
                    itemsets, rules = class_instance.solve(data=content['content'], params=model_params)
                    reformat_itemsets = {}
                    for key in itemsets.keys():
                        items = {}
                        for item in itemsets[key].keys():
                            items[','.join(list(item))] = itemsets[key][item]
                        reformat_itemsets[key] = items
                    rules_content = []
                    for rule in rules:
                        item = {
                            'lhs': list(rule.lhs),
                            'rhs': list(rule.rhs),
                            'conf': rule.confidence,
                            'supp': rule.support,
                            'lift': rule.lift,
                            'conv': rule.conviction,
                            'rpf': rule.rpf,
                            'count_full': rule.count_full,
                            'count_lhs': rule.count_lhs,
                            'count_rhs': rule.count_rhs
                        }
                        rules_content.append(item)
                    json_data = {
                        'itemsets': reformat_itemsets,
                        'rules': rules_content,
                        'min_support': numeric(params['min_support']),
                        'min_confidence': numeric(params['min_confidence']),
                        'max_length': numeric(params['max_length'])
                    }
                    with fs.open(result_path, 'w') as fout:
                        json.dump(json_data, fout, indent=2, ensure_ascii=False)
                    with fs.open(data_path, 'w') as fout:
                        json.dump(data_content, fout, indent=2, cls=NpEncoder, ensure_ascii=False)

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
        evaluation = Evaluation().query(item_id=item_id)[0]
        evaluation_file = EvaluationFile().query(evaluation_id=evaluation['evaluation_id'],
                                                 file_path='outputs/result.json')
        cur = 1
        reports = []
        if evaluation_file:
            report_content = file_client.download(evaluation_file[0]['file_key'])
            json_report = json.loads(report_content)
            datau = DatasetUtils()
            datau.set_header(['Min Support', 'Min Confidence', 'max Length'])
            datau.set_content([[round(json_report['min_support'], 4), round(json_report['min_confidence'], 4), round(json_report['max_length'], 4)]])
            reports.append({
                'id': cur,
                'name': 'Parameter',
                'type': 'table',
                'data': datau.format_dict()
            })
            cur += 1

            datau.set_header(['Count', 'Itemsets'])
            itemsets = json_report['itemsets']
            contents = []
            for key in itemsets.keys():
                for item in itemsets[key].keys():
                    row = [key, '%s(%s)' % (item, itemsets[key][item])]
                    contents.append(row)
            datau.set_content(contents)
            reports.append({
                'id': cur,
                'name': 'ItemSets',
                'type': 'table',
                'data': datau.format_dict()
            })
            cur += 1

            datau.set_header(['Antecedent', 'Consequent', 'Confidence', 'Support', 'Lift', 'conviction', 'rpf', 'Count'])
            rules = json_report['rules']
            contents = []
            for rule in rules:
                content = ['%s(%s)' % (','.join(list(rule['lhs'])), rule['count_lhs']), '%s(%s)' % (','.join(list(rule['rhs'])), rule['count_rhs']), round(rule['conf'], 4), round(rule['supp'], 4), round(rule['lift'], 4), round(rule['conv'], 4), round(rule['rpf'], 6), rule['count_full']]
                contents.append(content)
            datau.set_content(contents)
            reports.append({
                'id': cur,
                'name': 'Rules',
                'type': 'table',
                'data': datau.format_dict()
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

    def _format_content(self, data):
        rsts = []
        cur_idx = -1
        rst = []
        for item in data['content']:
            if numeric(item[0]) == cur_idx:
                rst.append(item[1])
            else:
                if cur_idx != -1:
                    rsts.append(rst)
                rst = [item[1]]
                cur_idx = numeric(item[0])
        rsts.append(rst)
        return {'content': rsts}

    def get_score(self, item_id):
        return ''
