from ..db import get_db
from ..models import GradeModel


class Grade:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, experimental_task_id, score=0):
        grade = GradeModel(user_id=user_id, experimental_task_id=experimental_task_id, score=score)
        try:
            self._db.add(grade)
            self._db.commit()
            g_id = grade.id
        except:
            self._db.rollback()
            g_id = -1
        finally:
            self._db.close()
        return g_id

    def query(self, grade_id=None, user_id=None, experimental_task_id=None, score=None, limit=None, offset=None):
        try:
            query = self._db.query(GradeModel)
            if grade_id is not None:
                query = query.filter(GradeModel.id == grade_id)
            if user_id is not None:
                query = query.filter(GradeModel.user_id == user_id)
            if experimental_task_id is not None:
                query = query.filter(GradeModel.experimental_task_id)
            if score is not None:
                query = query.filter(GradeModel.score == score)
            query = query.order_by(GradeModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            grades = map(lambda g: {
                'grade_id': g.id,
                'user_id': g.user_id,
                'experimental_task_id': g.experimental_task_id,
                'score': g.score,
                'create_time': g.create_time
            }, rets)
        finally:
            self._db.close()
        return grades

    def update(self, grade_id, score=None):
        flag = -1
        mp = {}
        if score is not None:
            mp['score'] = score
        try:
            self._db.query(GradeModel).filter(GradeModel.id == grade_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





