from sqlalchemy import func

from ..db import get_db
from ..models import ExperimentalItemModel, ClazzModel


class ExperimentalItem:
    def __init__(self):
        self._db = get_db()

    def create(self, clazz_id, experimental_item_name, description=None, deleted=0):
        experimental_item = ExperimentalItemModel(clazz_id=clazz_id, name=experimental_item_name, description=description, deleted=deleted)
        try:
            self._db.add(experimental_item)
            self._db.commit()
            ei_id = experimental_item.id
        except:
            self._db.rollback()
            ei_id = -1
        finally:
            self._db.close()
        return ei_id

    def query(self, experimental_item_id=None, experimental_item_name=None, experimental_item_name_like=None, clazz_id=None, clazz_name=None, teacher_id=None, description=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ExperimentalItemModel, ClazzModel).filter(ExperimentalItemModel.clazz_id == ClazzModel.id, ClazzModel.deleted == 0)
            if experimental_item_id is not None:
                query = query.filter(ExperimentalItemModel.id == experimental_item_id)
            if experimental_item_name is not None:
                query = query.filter(ExperimentalItemModel.name == experimental_item_name)
            if experimental_item_name_like is not None:
                query = query.filter(ExperimentalItemModel.name.like('%'+experimental_item_name_like+'%'))
            if clazz_id is not None:
                query = query.filter(ExperimentalItemModel.clazz_id == clazz_id)
            if clazz_name is not None:
                query = query.filter(ClazzModel.name == clazz_name)
            if teacher_id is not None:
                query = query.filter(ClazzModel.teacher_id == teacher_id)
            if description is not None:
                query = query.filter(ExperimentalItemModel.description == description)
            query = query.filter(ExperimentalItemModel.deleted == deleted)
            query = query.order_by(ExperimentalItemModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            eis = list(map(lambda ei: {
                'experimental_item_id': ei.ExperimentalItemModel.id,
                'experimental_item_name': ei.ExperimentalItemModel.name,
                'clazz_id': ei.ExperimentalItemModel.clazz_id,
                'clazz_name': ei.ClazzModel.name,
                'teacher_id': ei.ClazzModel.teacher_id,
                'description': ei.ExperimentalItemModel.description,
                'deleted': ei.ExperimentalItemModel.deleted,
                'create_time': ei.ExperimentalItemModel.create_time
            }, rets))
        finally:
            self._db.close()
        return eis

    def update(self, experimental_item_id, experimental_item_name=None, description=None):
        flag = -1
        mp = {}
        if experimental_item_name is not None:
            mp['name'] = experimental_item_name
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ExperimentalItemModel).filter(ExperimentalItemModel.id == experimental_item_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, experimental_item_id):
        flag = -1
        try:
            self._db.query(ExperimentalItemModel).filter(ExperimentalItemModel.id == experimental_item_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def get_count(self, teacher_id, experimental_item_name_like=None):
        try:
            if experimental_item_name_like is None:
                experimental_item_name_like = ''
            count = self._db.query(func.count(ExperimentalItemModel.id)).filter(ClazzModel.id == ExperimentalItemModel.clazz_id, ClazzModel.teacher_id == teacher_id, ExperimentalItemModel.name.like('%'+experimental_item_name_like+'%')).first()[0]
        finally:
            self._db.close()
        return count
