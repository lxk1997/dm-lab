from ..db import get_db
from ..models import ClassesModel


class Classes:
    def __init__(self):
        self._db = get_db()

    def create(self, classes_name, teacher_id, invite_code, deleted, description=None):
        classes = ClassesModel(name=classes_name, teacher_id=teacher_id, description=description, invite_code=invite_code, deleted=deleted)
        try:
            self._db.add(classes)
            self._db.commit()
            c_id = classes.id
        except:
            self._db.rollback()
            c_id = -1
        finally:
            self._db.close()
        return c_id

    def query(self, classes_id=None, classes_name=None, teacher_id=None, invite_code=None, deleted=0, description=None, limit=None, offset=None):
        try:
            query = self._db.query(ClassesModel)
            if classes_id is not None:
                query = query.filter(ClassesModel.id == classes_id)
            if classes_name is not None:
                query = query.filter(ClassesModel.name == classes_name)
            if teacher_id is not None:
                query = query.filter(ClassesModel.teacher_id == teacher_id)
            if invite_code is not None:
                query = query.filter(ClassesModel.invite_code == invite_code)
            if description is not None:
                query = query.filter(ClassesModel.description == description)
            query = query.filter(ClassesModel.deleted == deleted)
            query = query.order_by(ClassesModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            classes = map(lambda c: {
                'classes_id': c.id,
                'classes_name': c.name,
                'teacher_id': c.teacher_id,
                'invite_code': c.invite_code,
                'deleted': c.deleted,
                'description': c.description,
                'create_time': c.create_time
            }, rets)
        finally:
            self._db.close()
        return classes

    def update(self, classes_id, classes_name=None, description=None):
        flag = -1
        mp = {}
        if classes_name is not None:
            mp['name'] = classes_name
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ClassesModel).filter(ClassesModel.id == classes_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, classes_id):
        flag = -1
        try:
            self._db.query(ClassesModel).filter(ClassesModel.id == classes_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





