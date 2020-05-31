from sqlalchemy import func

from ..db import get_db
from ..models import ClazzModel, UserClazzRelationModel, UserModel, UserInfoModel


class Clazz:
    def __init__(self):
        self._db = get_db()

    def create(self, clazz_name, teacher_id, invite_code, deleted=0, description=None):
        clazz = ClazzModel(name=clazz_name, teacher_id=teacher_id, description=description, invite_code=invite_code, deleted=deleted)
        try:
            self._db.add(clazz)
            self._db.commit()
            c_id = clazz.id
        except:
            self._db.rollback()
            c_id = -1
        finally:
            self._db.close()
        return c_id

    def query(self, clazz_id=None, clazz_name=None, teacher_id=None, invite_code=None, deleted=0, description=None, limit=None, offset=None):
        try:
            query = self._db.query(ClazzModel, UserModel, UserInfoModel).filter(ClazzModel.teacher_id == UserModel.id, UserModel.id == UserInfoModel.user_id)
            if clazz_id is not None:
                query = query.filter(ClazzModel.id == clazz_id)
            if clazz_name is not None:
                query = query.filter(ClazzModel.name == clazz_name)
            if teacher_id is not None:
                query = query.filter(ClazzModel.teacher_id == teacher_id)
            if invite_code is not None:
                query = query.filter(ClazzModel.invite_code == invite_code)
            if description is not None:
                query = query.filter(ClazzModel.description == description)
            query = query.filter(ClazzModel.deleted == deleted)
            query = query.order_by(ClazzModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            clazzes = list(map(lambda c: {
                'clazz_id': c.ClazzModel.id,
                'clazz_name': c.ClazzModel.name,
                'teacher_id': c.ClazzModel.teacher_id,
                'teacher_name': c.UserInfoModel.name,
                'deleted': c.ClazzModel.deleted,
                'invite_code': c.ClazzModel.invite_code,
                'description': c.ClazzModel.description,
                'create_time': c.ClazzModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return clazzes

    def update(self, clazz_id, clazz_name=None, description=None):
        flag = -1
        mp = {}
        if clazz_name is not None:
            mp['name'] = clazz_name
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ClazzModel).filter(ClazzModel.id == clazz_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, clazz_id):
        flag = -1
        try:
            self._db.query(ClazzModel).filter(ClazzModel.id == clazz_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def get_count(self, teacher_id):
        try:
            count = self._db.query(func.count(ClazzModel.id)).filter(ClazzModel.teacher_id == teacher_id).first()[0]
        finally:
            self._db.close()
        return count





