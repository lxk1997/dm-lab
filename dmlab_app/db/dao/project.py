from ..db import get_db
from ..models import ProjectModel


class Project:
    def __init__(self):
        self._db = get_db()

    def create(self, project_name, user_id, content=None, description=None, deleted=0):
        project = ProjectModel(name=project_name, user_id=user_id, content=content, description=description, deleted=deleted)
        try:
            self._db.add(project)
            self._db.commit()
            p_id = project.id
        except:
            self._db.rollback()
            p_id = -1
        finally:
            self._db.close()
        return p_id

    def query(self, project_id=None, project_name=None, user_id=None, content=None, description=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ProjectModel)
            if project_id is not None:
                query = query.filter(ProjectModel.id == project_id)
            if project_name is not None:
                query = query.filter(ProjectModel.name == project_name)
            if user_id is not None:
                query = query.filter(ProjectModel.user_id == user_id)
            if content is not None:
                query = query.filter(ProjectModel.content == content)
            if description is not None:
                query = query.filter(ProjectModel.description == description)
            query = query.filter(ProjectModel.deleted == deleted)
            query = query.order_by(ProjectModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            projects = map(lambda p: {
                'project_id': p.id,
                'project_name': p.name,
                'user_id': p.user_id,
                'content': p.content,
                'deleted': p.deleted,
                'description': p.description,
                'create_time': p.create_time
            }, rets)
        finally:
            self._db.close()
        return projects

    def update(self, project_id, project_name=None, content=None, description=None):
        flag = -1
        mp = {}
        if project_name is not None:
            mp['name'] = project_name
        if content is not None:
            mp['content'] = content
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ProjectModel).filter(ProjectModel.id == project_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, project_id):
        flag = -1
        try:
            self._db.query(ProjectModel).filter(ProjectModel.id == project_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





