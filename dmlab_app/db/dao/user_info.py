from ..models import UserInfoModel, UserModel
from ..db import get_db


class UserInfo:
    def __init__(self):
        self._db = get_db()

    def create(self, user_id, name=None, sex=None, grade=None, clazz=None, school_id=None, major=None, department=None):
        user_info = UserInfoModel(user_id=user_id, name=name, sex=sex, grade=grade, clazz=clazz, major=major, department=department)
        try:
            self._db.add(user_info)
            self._db.commit()
            u_id = user_info.id
        except:
            self._db.rollback()
            u_id = -1
        finally:
            self._db.close()
        return u_id

    def query(self, user_info_id=None, user_id=None, school_id=None, name=None, department=None, major=None, limit=None, offset=None):
        try:
            query = self._db.query(UserInfoModel, UserModel).filter(UserInfoModel.user_id == UserModel.id)
            if user_info_id is not None:
                query = query.filter(UserInfoModel.id == user_info_id)
            if user_id is not None:
                query = query.filter(UserInfoModel.user_id == user_id)
            if school_id is not None:
                query = query.filter(UserModel.school_id == school_id)
            if name is not None:
                query = query.filter(UserInfoModel.name == name)
            if department is not None:
                query = query.filter(UserInfoModel.department == department)
            if major is not None:
                query = query.filter(UserInfoModel.major == major)
            query = query.order_by(UserInfoModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            user_infos = list(map(lambda u: {
                'user_info_id': u.UserInfoModel.id,
                'user_id': u.UserInfoModel.user_id,
                'school_id': u.UserModel.school_id,
                'name': u.UserInfoModel.name,
                'department': u.UserInfoModel.department,
                'major': u.UserInfoModel.major,
                'grade': u.UserInfoModel.grade,
                'clazz': u.UserInfoModel.clazz,
                'sex': u.UserInfoModel.sex,
                'password': u.UserModel.password,
                'email': u.UserModel.email,
                'create_time': u.UserInfoModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return user_infos

    def update(self, user_id, name=None, department=None, major=None, grade=None, clazz=None, sex=None):
        flag = -1
        mp = {}
        if name is not None:
            mp['name'] = name
        if department is not None:
            mp['department'] = department
        if major is not None:
            mp['major'] = major
        if grade is not None:
            mp['grade'] = grade
        if clazz is not None:
            mp['clazz'] = clazz
        if sex is not None:
            mp['sex'] = sex
        try:
            self._db.query(UserInfoModel).filter(UserInfoModel.user_id == user_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag




