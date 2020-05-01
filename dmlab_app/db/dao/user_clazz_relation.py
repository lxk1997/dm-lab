from sqlalchemy import func

from ..db import get_db
from ..models import UserClazzRelationModel, ClazzModel, UserModel


class UserClazzRelation:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, clazz_id, deleted=0):
        user_clazz_relation = UserClazzRelationModel(user_id=user_id, clazz_id=clazz_id, deleted=deleted)
        try:
            self._db.add(user_clazz_relation)
            self._db.commit()
            ucr_id = user_clazz_relation.id
        except:
            self._db.rollback()
            ucr_id = -1
        finally:
            self._db.close()
        return ucr_id

    def query(self, user_id=None, clazz_id=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(UserClazzRelationModel, ClazzModel, UserModel).filter(UserClazzRelationModel.clazz_id == ClazzModel.id, UserClazzRelationModel.user_id == UserModel.id, ClazzModel.deleted == 0)
            if user_id is not None:
                query = query.filter(UserClazzRelationModel.user_id == user_id)
            if clazz_id is not None:
                query = query.filter(UserClazzRelationModel.clazz_id == clazz_id)
            query = query.filter(UserClazzRelationModel.deleted == deleted)
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            ucrs = list(map(lambda ucr: {
                'user_clazz_relation_id': ucr.UserClazzRelationModel.id,
                'user_id': ucr.UserClazzRelationModel.user_id,
                'user_name': ucr.UserModel.username,
                'teacher_id': ucr.ClazzModel.teacher_id,
                'email': ucr.UserModel.email,
                'clazz_id': ucr.UserClazzRelationModel.clazz_id,
                'deleted': ucr.UserClazzRelationModel.deleted,
                'join_time': ucr.UserClazzRelationModel.join_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return ucrs

    def delete(self, user_clazz_relation_id):
        flag = -1
        try:
            self._db.query(UserClazzRelationModel).filter(UserClazzRelationModel.id == user_clazz_relation_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def get_count(self, clazz_id=None, user_id=None):
        count = 0
        try:
            if clazz_id:
                count = self._db.query(func.count(UserClazzRelationModel.id)).filter(UserClazzRelationModel.clazz_id == clazz_id, UserClazzRelationModel.deleted == 0).first()[0]
            if user_id:
                count = self._db.query(func.count(UserClazzRelationModel.id)).filter(UserClazzRelationModel.user_id == user_id, UserClazzRelationModel.deleted == 0).first()[0]
        finally:
            self._db.close()
        return count





