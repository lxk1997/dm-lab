from ..db import get_db
from ..models import ExperimentalItemModel, ClassesModel


class ExperimentalItem:
    def __init__(self):
        self._db = get_db()

    def create(self, classes_id, experimental_item_name, description=None, deleted=0):
        experimental_item = ExperimentalItemModel(classes_id=classes_id, name=experimental_item_name, description=description, deleted=deleted)
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

    def query(self, experimental_item_id=None, experimental_item_name=None, classes_id=None, description=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ExperimentalItemModel, ClassesModel).filter(ExperimentalItemModel.classes_id == ClassesModel.id, ClassesModel.deleted == 0)
            if experimental_item_id is not None:
                query = query.filter(ExperimentalItemModel.id == experimental_item_id)
            if experimental_item_name is not None:
                query = query.filter(ExperimentalItemModel.name == experimental_item_name)
            if classes_id is not None:
                query = query.filter(ExperimentalItemModel.classes_id == classes_id)
            if description is not  None:
                query = query.filter(ExperimentalItemModel.description == description)
            query = query.filter(ExperimentalItemModel.deleted == deleted)
            query = query.order_by(ExperimentalItemModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            eis = map(lambda ei: {
                'experimental_item_id': ei.ExperimentalItemModel.id,
                'experimental_item_name': ei.ExperimentalItemModel.name,
                'classes_id': ei.ExperimentalItemModel.classes_id,
                'description': ei.ExperimentalItemModel.description,
                'deleted': ei.ExperimentalItemModel.deleted,
                'create_time': ei.ExperimentalItemModel.create_time
            }, rets)
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