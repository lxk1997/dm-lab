from ..db import get_db
from ..models import ComponentTypeModel


class ComponentType:
    def __init__(self):
        self._db = get_db()

    def create(self, component_type_name, deleted=0):
        component_type = ComponentTypeModel(name=component_type_name, deleted=deleted)
        try:
            self._db.add(component_type)
            self._db.commit()
            ct_id = component_type.id
        except:
            self._db.rollback()
            ct_id = -1
        finally:
            self._db.close()
        return ct_id

    def query(self, component_type_id=None, component_type_name=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ComponentTypeModel)
            if component_type_id is not None:
                query = query.filter(ComponentTypeModel.id == component_type_id)
            if component_type_name is not None:
                query = query.filter(ComponentTypeModel.name == component_type_name)
            query = query.filter(ComponentTypeModel.deleted == deleted)
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            component_types = map(lambda ct: {
                'component_type_id': ct.id,
                'component_type_name': ct.name,
                'deleted': ct.deleted
            }, rets)
        finally:
            self._db.close()
        return component_types

    def update(self, component_type_id, component_type_name=None):
        flag = -1
        mp = {}
        if component_type_name is not None:
            mp['name'] = component_type_name
        try:
            self._db.query(ComponentTypeModel).filter(ComponentTypeModel.id == component_type_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, component_type_id):
        flag = -1
        try:
            self._db.query(ComponentTypeModel).filter(ComponentTypeModel.id == component_type_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





