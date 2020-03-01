from ..db import get_db
from ..models import UserClassesRelationModel, ClassesModel


class UserClassesRelation:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, classes_id, deleted=0):
        user_classes_relation = UserClassesRelationModel(user_id=user_id, classes_id=classes_id, deleted=deleted)
        try:
            self._db.add(user_classes_relation)
            self._db.commit()
            ucr_id = user_classes_relation.id
        except:
            self._db.rollback()
            ucr_id = -1
        finally:
            self._db.close()
        return ucr_id

    def query(self, user_id=None, classes_id=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(UserClassesRelationModel, ClassesModel).filter(UserClassesRelationModel.classes_id == ClassesModel.id, ClassesModel.deleted == 0)
            if user_id is not None:
                query = query.filter(UserClassesRelationModel.user_id == user_id)
            if classes_id is not None:
                query = query.filter(UserClassesRelationModel.classes_id == classes_id)
            query = query.filter(UserClassesRelationModel.deleted == deleted)
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            ucrs = map(lambda ucr: {
                'user_id': ucr.UserClassesRelationModel.user_id,
                'classes_id': ucr.UserClassesRelationModel.classes_id,
                'deleted': ucr.UserClassesRelationModel.deleted
            }, rets)
        finally:
            self._db.close()
        return ucrs

    def delete(self, user_classes_relation_id):
        flag = -1
        try:
            self._db.query(UserClassesRelationModel).filter(UserClassesRelationModel.id == user_classes_relation_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





