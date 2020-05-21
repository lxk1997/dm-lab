from ..db import get_db
from ..models import EvaluationModel, UserModel, ExperimentalTaskModel, ExperimentalItemModel, ClazzModel


class Evaluation:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, experimental_task_id, task_name, status, deleted=0):
        evaluation = EvaluationModel(user_id=user_id, experimental_task_id=experimental_task_id, status=status, task_name=task_name, deleted=deleted)
        try:
            self._db.add(evaluation)
            self._db.commit()
            e_id = evaluation.id
        except:
            self._db.rollback()
            e_id = -1
        finally:
            self._db.close()
        return e_id

    def query(self, evaluation_id=None, user_id=None, experimental_task_id=None, task_name=None, status=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(EvaluationModel, UserModel, ExperimentalTaskModel, ExperimentalItemModel, ClazzModel).filter(EvaluationModel.user_id==UserModel.id, EvaluationModel.experimental_task_id==ExperimentalTaskModel.id, ExperimentalTaskModel.deleted == 0, ExperimentalTaskModel.experimental_item_id == ExperimentalItemModel.id, ExperimentalItemModel.clazz_id == ClazzModel.id)
            if evaluation_id is not None:
                query = query.filter(EvaluationModel.id == evaluation_id)
            if user_id is not None:
                query = query.filter(EvaluationModel.user_id == user_id)
            if experimental_task_id is not None:
                query = query.filter(EvaluationModel.experimental_task_id)
            if status is not None:
                query = query.filter(EvaluationModel.status == status)
            if task_name is not None:
                query = query.filter(EvaluationModel.task_name == task_name)
            query = query.filter(EvaluationModel.deleted == deleted)
            query = query.order_by(EvaluationModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            evaluations = list(map(lambda e: {
                'evaluation_id': e.EvaluationModel.id,
                'user_id': e.EvaluationModel.user_id,
                'experimental_task_id': e.EvaluationModel.experimental_task_id,
                'status': e.EvaluationModel.status,
                'task_name': e.EvaluationModel.task_name,
                'experimental_task_name': e.ExperimentalTaskModel.name,
                'experimental_item_id': e.ExperimentalItemModel.id,
                'experimental_item_name': e.ExperimentalItemModel.name,
                'clazz_id': e.ClazzModel.id,
                'clazz_name': e.ClazzModel.name,
                'user_name': e.UserModel.username,
                'deleted': e.EvaluationModel.deleted,
                'create_time': e.EvaluationModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return evaluations

    def update(self, evaluation_id, status=None):
        flag = -1
        mp = {}
        if status is not None:
            mp['status'] = status
        try:
            self._db.query(EvaluationModel).filter(EvaluationModel.id == evaluation_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





