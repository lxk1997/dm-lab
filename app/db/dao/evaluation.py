from ..db import get_db
from ..models import EvaluationModel


class Evaluation:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, experimental_task_id, status, content):
        evaluation = EvaluationModel(user_id=user_id, experimental_task_id=experimental_task_id, status=status, content=content)
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

    def query(self, evaluation_id=None, user_id=None, experimental_task_id=None, status=None, content=None, limit=None, offset=None):
        try:
            query = self._db.query(EvaluationModel)
            if evaluation_id is not None:
                query = query.filter(EvaluationModel.id == evaluation_id)
            if user_id is not None:
                query = query.filter(EvaluationModel.user_id == user_id)
            if experimental_task_id is not None:
                query = query.filter(EvaluationModel.experimental_task_id)
            if status is not None:
                query = query.filter(EvaluationModel.status == status)
            if content is not None:
                query = query.filter(EvaluationModel.content == content)
            query = query.order_by(EvaluationModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            evaluations = map(lambda e: {
                'evaluation_id': e.id,
                'user_id': e.user_id,
                'experimental_task_id': e.experimental_task_id,
                'status': e.status,
                'content': e.content,
                'create_time': e.create_time
            }, rets)
        finally:
            self._db.close()
        return evaluations

    def update(self, evaluation_id, status=None, content=None):
        flag = -1
        mp = {}
        if status is not None:
            mp['status'] = status
        if content is not None:
            mp['content'] = content
        try:
            self._db.query(EvaluationModel).filter(EvaluationModel.id == evaluation_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





