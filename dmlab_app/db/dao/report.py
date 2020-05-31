from sqlalchemy import func

from ..db import get_db
from ..models import ExperimentalItemModel, ClazzModel, ReportModel, UserModel, ExperimentalTaskModel, UserInfoModel


class Report:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, experimental_task_id, task_name, data_id, content=None, file_key=None,  score=None, deleted=0, score_content=None):
        report = ReportModel(user_id=user_id, experimental_task_id=experimental_task_id, task_name=task_name, data_id=data_id, content=content, file_key=file_key, score=score, deleted=deleted, score_content=score_content)
        try:
            self._db.add(report)
            self._db.commit()
            r_id = report.id
        except:
            self._db.rollback()
            r_id = -1
        finally:
            self._db.close()
        return r_id

    def query(self, report_id=None, experimental_task_id=None, user_id=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ReportModel, UserModel, ExperimentalTaskModel, ExperimentalItemModel, ClazzModel, UserInfoModel).filter(ReportModel.user_id==UserModel.id, ReportModel.experimental_task_id==ExperimentalTaskModel.id, ExperimentalTaskModel.deleted == 0, ExperimentalTaskModel.experimental_item_id == ExperimentalItemModel.id, ExperimentalItemModel.clazz_id == ClazzModel.id, UserModel.id == UserInfoModel.user_id)
            if report_id is not None:
                query = query.filter(ReportModel.id == report_id)
            if experimental_task_id is not None:
                query = query.filter(ReportModel.experimental_task_id == experimental_task_id)
            if user_id is not None:
                query = query.filter(ReportModel.user_id == user_id)
            query = query.filter(ReportModel.deleted == deleted)
            query = query.order_by(ReportModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            rs = list(map(lambda r: {
                'report_id': r.ReportModel.id,
                'experimental_task_id': r.ExperimentalTaskModel.id,
                'experimental_task_name': r.ExperimentalTaskModel.name,
                'experimental_item_id': r.ExperimentalItemModel.id,
                'experimental_item_name': r.ExperimentalItemModel.name,
                'clazz_id': r.ClazzModel.id,
                'clazz_name': r.ClazzModel.name,
                'task_name': r.ReportModel.task_name,
                'data_id': r.ReportModel.data_id,
                'user_id': r.ReportModel.user_id,
                'name': r.UserInfoModel.name,
                'school_id': r.UserModel.school_id,
                'content': r.ReportModel.content,
                'file_key': r.ReportModel.file_key,
                'score': round(float(r.ReportModel.score), 2) if r.ReportModel.score is not None else None,
                'score_content': r.ReportModel.score_content,
                'deleted': r.ReportModel.deleted,
                'create_time': r.ReportModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        except Exception as e:
            print(e.args)
        finally:
            self._db.close()
        return rs

    def update(self, report_id, score=None):
        flag = -1
        mp = {}
        if score is not None:
            mp['score'] = score
        try:
            self._db.query(ReportModel).filter(ReportModel.id == report_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, report_id):
        flag = -1
        try:
            self._db.query(ReportModel).filter(ReportModel.id == report_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag
