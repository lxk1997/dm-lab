from ..db import get_db
from ..models import RoleModel


class Role:
    def __init__(self):
        self._db = get_db()

    def create(self, role_name):
        role = RoleModel(name=role_name)
        try:
            self._db.add(role)
            self._db.commit()
            r_id = role.id
        except:
            self._db.rollback()
            r_id = -1
        finally:
            self._db.close()
        return r_id

    def query(self, role_id=None, role_name=None, limit=None, offset=None):
        try:
            query = self._db.query(RoleModel)
            if role_id is not None:
                query = query.filter(RoleModel.id == role_id)
            if role_name is not None:
                query = query.filter(RoleModel.name == role_name)
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            roles = map(lambda r: {
                'role_id': r.id,
                'role_name': r.name
            }, rets)
        finally:
            self._db.close()
        return roles

    def update(self, role_id, role_name=None):
        flag = -1
        mp = {}
        if role_name is not None:
            mp['name'] = role_name
        try:
            self._db.query(RoleModel).filter(RoleModel.id == role_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

