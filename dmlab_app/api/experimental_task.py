# coding=utf-8
import logging
import os
from datetime import datetime

from flask import Blueprint, request, g, url_for

from .auth import login_required
from ..db.dao.experimental_item import ExperimentalItem
from ..db.dao.experimental_task import ExperimentalTask
from ..db.dao.report import Report
from ..db.dao.user_clazz_relation import UserClazzRelation
from ..utils import api_response

logger = logging.getLogger(__name__)

bp = Blueprint('api_experimental_task', __name__, url_prefix='/api/experimental-task')


@bp.route('/<int:experimental_task_id>', methods=['GET'])
@login_required
def handle_get_experimental_task(experimental_task_id):
    experimental_tasks = ExperimentalTask().query(experimental_task_id=experimental_task_id)
    data = {}
    if not experimental_tasks:
        msg = 'Experimental Task %d does not exists' % experimental_task_id
        error = 1
    else:
        experimental_task = experimental_tasks[0]
        if datetime.now() < experimental_task['start_time']:
            status = '未开始'
        elif datetime.now() < experimental_task['dead_line']:
            status = '正在进行'
        else:
            status = '已结束'
        experimental_task['status'] = status
        experimental_task['create_time'] = experimental_task['create_time'].strftime("%Y-%m-%d  %H:%M:%S")
        experimental_task['start_time'] = experimental_task['start_time'].strftime("%Y-%m-%d  %H:%M:%S")
        experimental_task['dead_line'] = experimental_task['dead_line'].strftime("%Y-%m-%d  %H:%M:%S")
        experimental_task['file_path'] = url_for('files_file.handle_get_info', path=experimental_task['file_key'])
        experimental_task['file_name'] = os.path.basename(experimental_task['file_key'])
        if not UserClazzRelation().query(user_id=g.user['user_id'], clazz_id=experimental_task['clazz_id']):
            msg = 'Permission denied.'
            error = 1
        else:
            data = experimental_task
            msg = 'ok'
            error = 0
    return api_response(msg, error, data)


@bp.route('', methods=['GET'])
@login_required
def handle_get_experimental_tasks():
    limit = request.args.get('limit', None)
    offset = request.args.get('offset', None)
    experimental_item_id = request.args.get('experimental_item_id')
    experimental_tasks = ExperimentalTask().query(experimental_item_id=experimental_item_id, limit=limit, offset=offset)
    for experimental_task in experimental_tasks:
        if datetime.now() < experimental_task['start_time']:
            status = '未开始'
        elif datetime.now() < experimental_task['dead_line']:
            status = '正在进行'
        else:
            status = '已结束'
        experimental_task['status'] = status
        experimental_task['create_time'] = experimental_task['create_time'].strftime("%Y-%m-%d  %H:%M:%S")
        experimental_task['start_time'] = experimental_task['start_time'].strftime("%Y-%m-%d  %H:%M:%S")
        experimental_task['dead_line'] = experimental_task['dead_line'].strftime("%Y-%m-%d  %H:%M:%S")
    count = 1
    data = {
        'detail': experimental_tasks,
        'count': count
    }
    return api_response('ok', 0, data)


@bp.route('/<int:experimental_task_id>/leaderboard', methods=['GET'])
@login_required
def handle_get_experimental_task_leaderboard(experimental_task_id):
    experimental_tasks = ExperimentalTask().query(experimental_task_id=experimental_task_id)
    data = {}
    if not experimental_tasks:
        msg = 'Experimental Task %d does not exists' % experimental_task_id
        error = 1
    else:
        experimental_task = experimental_tasks[0]
        if datetime.now() < experimental_task['start_time']:
            status = '未开始'
        elif datetime.now() < experimental_task['dead_line']:
            status = '正在进行'
        else:
            status = '已结束'
        experimental_task['status'] = status
        rsts = []
        user_clazz_relations = UserClazzRelation().query(clazz_id=experimental_task['clazz_id'])
        for user_clazz_relation in user_clazz_relations:
            report = Report().query(experimental_task_id=experimental_task_id, user_id=user_clazz_relation['user_id'])
            if report:
                rsts.append(report[0])

        data = rsts
        msg = 'ok'
        error = 0
    return api_response(msg, error, data)

