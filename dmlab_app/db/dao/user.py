from ..models import UserModel
from ..db import get_db


class User:
    def __init__(self):
        self._db = get_db()

    def create(self, school_id, password, email, role_id):
        user = UserModel(school_id=school_id, password=password, email=email, role_id=role_id)
        try:
            self._db.add(user)
            self._db.commit()
            u_id = user.id
        except:
            self._db.rollback()
            u_id = -1
        finally:
            self._db.close()
        return u_id

    def query(self, user_id=None, school_id=None, email=None, limit=None, offset=None):
        try:
            query = self._db.query(UserModel)
            if user_id is not None:
                query = query.filter(UserModel.id == user_id)
            if school_id is not None:
                query = query.filter(UserModel.school_id == school_id)
            if email is not None:
                query = query.filter(UserModel.email == email)
            query = query.order_by(UserModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            users = list(map(lambda u: {
                'user_id': u.id,
                'school_id': u.school_id,
                'password': u.password,
                'email': u.email,
                'create_time': u.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return users

    def update(self, user_id, password=None, email=None):
        flag = -1
        mp = {}
        if password is not None:
            mp['password'] = password
        if email is not None:
            mp['email'] = email
        try:
            self._db.query(UserModel).filter(UserModel.id == user_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag




