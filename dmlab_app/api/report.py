import logging

from flask import Blueprint, g

from .auth import login_required
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.report import Report
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

# TODO
logger = logging.getLogger(__name__)

bp = Blueprint('api_report', __name__, url_prefix='/api/report')


@bp.route('/mine', methods=['GET'])
@login_required
def handle_get_mine_reports():
    reports = Report().query(user_id=g.user['user_id'])
    data = []
    mp = {}
    for report in reports:
        if mp.get(report['experimental_task_id']):
            continue
        else:
            mp[report['experimental_task_id']] = 1
            score = (report['score'] if report.get('score') and report['score'] != '' else '')
            tmp_reports = Report().query(experimental_task_id=report['experimental_task_id'])
            tmp_mp = {}
            rank = 1
            for tmp_report in tmp_reports:
                if tmp_mp.get(tmp_report['user_id']) or tmp_report['user_id'] == g.user['user_id']:
                    continue
                else:
                    if score and tmp_report.get('score') and tmp_report['score'] != '' and tmp_report['score'] > score:
                        rank += 1
                        tmp_mp[tmp_report['user_id']] = 1
            experimental_task = ExperimentalTask().query(experimental_task_id=report['experimental_task_id'])[0]
            report['experimental_item_id'] = experimental_task['experimental_item_id']
            report['experimental_item_name'] = experimental_task['experimental_item_name']
            report['clazz_id'] = experimental_task['clazz_id']
            report['clazz_name'] = experimental_task['clazz_name']
            if score == '':
                report['score'] = '暂无'
                report['rank'] = '暂无'
            else:
                report['rank'] = '%d/%d' % (rank, UserClazzRelation().get_count(clazz_id=experimental_task['clazz_id']))
            data.append(report)
    data = {'detail': data}
    return api_response('ok', 0, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_reports():
    reports = Report().query(limit=1024)
    data = {'detail': reports}
    return api_response('ok', 0, data)
