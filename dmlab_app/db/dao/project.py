from ..db import get_db
from ..models import ProjectModel, ExperimentalItemModel, ExperimentalTaskModel, ClazzModel


class Project:
    def __init__(self):
        self._db = get_db()

    def create(self, project_name, user_id, clazz_id, experimental_item_id, experimental_task_id, content=None, deleted=0):
        project = ProjectModel(name=project_name, user_id=user_id, content=content, deleted=deleted, clazz_id=clazz_id, experimental_item_id=experimental_item_id, experimental_task_id=experimental_task_id)
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
            query = self._db.query(ProjectModel, ExperimentalItemModel, ExperimentalTaskModel, ClazzModel).filter(ProjectModel.experimental_task_id == ExperimentalTaskModel.id, ProjectModel.experimental_item_id == ExperimentalItemModel.id, ProjectModel.clazz_id == ClazzModel.id)
            if project_id is not None:
                query = query.filter(ProjectModel.id == project_id)
            if project_name is not None:
                query = query.filter(ProjectModel.name == project_name)
            if user_id is not None:
                query = query.filter(ProjectModel.user_id == user_id)
            if content is not None:
                query = query.filter(ProjectModel.content == content)
            query = query.filter(ProjectModel.deleted == deleted)
            query = query.order_by(ProjectModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            projects = list(map(lambda p: {
                'project_id': p.ProjectModel.id,
                'project_name': p.ProjectModel.name,
                'user_id': p.ProjectModel.user_id,
                'content': p.ProjectModel.content,
                'deleted': p.ProjectModel.deleted,
                'clazz_id': p.ProjectModel.clazz_id,
                'clazz_name': p.ClazzModel.name,
                'experimental_item_id': p.ProjectModel.experimental_item_id,
                'experimental_item_name': p.ExperimentalItemModel.name,
                'experimental_task_id': p.ProjectModel.experimental_task_id,
                'experimental_task_name': p.ExperimentalTaskModel.name,
                'create_time': p.ProjectModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return projects

    def update(self, project_id, project_name=None, content=None):
        flag = -1
        mp = {}
        if project_name is not None:
            mp['name'] = project_name
        if content is not None:
            mp['content'] = content
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





