from ..db import get_db
from ..models import ComponentModel, ComponentTypeModel


class Component:
    def __init__(self):
        self._db = get_db()

    def create(self, component_name, component_type_id, is_public, deleted=0, description=None, user_id=None):
        component = ComponentModel(name=component_name, component_type_id=component_type_id, is_public=is_public, description=description, user_id=user_id, deleted=deleted)
        try:
            self._db.add(component)
            self._db.commit()
            c_id = component.id
        except:
            self._db.rollback()
            c_id = -1
        finally:
            self._db.close()
        return c_id

    def query(self, component_id=None, component_name=None, component_type_id=None, is_public=None, user_id=None, description=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ComponentModel, ComponentTypeModel).filter(ComponentModel.component_type_id == ComponentTypeModel.id, ComponentTypeModel.deleted == 0)
            if component_id is not None:
                query = query.filter(ComponentModel.id == component_id)
            if component_name is not None:
                query = query.filter(ComponentModel.name == component_name)
            if component_type_id is not None:
                query = query.filter(ComponentModel.component_type_id == component_type_id)
            if is_public is not None:
                query = query.filter(ComponentModel.is_public == is_public)
            if user_id is not None:
                query = query.filter(ComponentModel.user_id == user_id)
            if description is not  None:
                query = query.filter(ComponentModel.description == description)
            query = query.filter(ComponentModel.deleted == deleted)
            query = query.order_by(ComponentModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            components = map(lambda c: {
                'component_id': c.ComponentModel.id,
                'component_name': c.ComponentModel.name,
                'component_type_id': c.ComponentModel.component_type_id,
                'is_public': c.ComponentModel.is_public,
                'user_id': c.ComponentModel.user_id,
                'deleted': c.ComponentModel.deleted,
                'description': c.ComponentModel.description,
                'create_time': c.ComponentModel.create_time
            }, rets)
        finally:
            self._db.close()
        return components

    def update(self, component_id, component_name=None, description=None):
        flag = -1
        mp = {}
        if component_name is not None:
            mp['name'] = component_name
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ComponentModel).filter(ComponentModel.id == component_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, component_id):
        flag = -1
        try:
            self._db.query(ComponentModel).filter(ComponentModel.id == component_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





