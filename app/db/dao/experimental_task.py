from ..db import get_db
from ..models import ExperimentalItemModel, ClassesModel, ExperimentalTaskModel


class ExperimentalTask:
    def __init__(self):
        self._db = get_db()

    def create(self, experimental_item_id, experimental_task_name, start_time, dead_line,  description=None, deleted=0, content=None, file=None):
        experimental_task = ExperimentalTaskModel(experimental_item_id=experimental_item_id, name=experimental_task_name, description=description, deleted=deleted, start_time=start_time, dead_line=dead_line, content=content, file=file)
        try:
            self._db.add(experimental_task)
            self._db.commit()
            et_id = experimental_task.id
        except:
            self._db.rollback()
            et_id = -1
        finally:
            self._db.close()
        return et_id

    def query(self, experimental_task_id=None, experimental_task_name=None, experimental_item_id=None, classes_id=None, start_time=None, dead_line=None, content=None, file=None, description=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(ExperimentalTaskModel, ExperimentalItemModel, ClassesModel).filter(ExperimentalTaskModel.experimental_item_id == ExperimentalItemModel.id, ExperimentalItemModel.classes_id == ClassesModel.id, ClassesModel.deleted == 0, ExperimentalItemModel.deleted == 0)
            if experimental_task_id is not None:
                query = query.filter(ExperimentalTaskModel.id == experimental_task_id)
            if experimental_task_name is not None:
                query = query.filter(ExperimentalTaskModel.name == experimental_task_name)
            if experimental_item_id is not None:
                query = query.filter(ExperimentalTaskModel.experimental_item_id == experimental_item_id)
            if classes_id is not None:
                query = query.filter(ExperimentalItemModel.classes_id == classes_id)
            if start_time is not None:
                query = query.filter(ExperimentalTaskModel.start_time == start_time)
            if dead_line is not None:
                query = query.filter(ExperimentalTaskModel.dead_line == dead_line)
            if content is not None:
                query = query.filter(ExperimentalTaskModel.content == content)
            if file is not None:
                query = query.filter(ExperimentalTaskModel.file == file)
            if description is not  None:
                query = query.filter(ExperimentalTaskModel.description == description)
            query = query.filter(ExperimentalTaskModel.deleted == deleted)
            query = query.order_by(ExperimentalTaskModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            ets = map(lambda et: {
                'experimental_task_id': et.ExperimentalTaskModel.id,
                'experimental_task_name': et.ExperimentalTaskModel.name,
                'experimental_item_id': et.ExperimentalTaskModel.experimental_item_id,
                'classes_id': et.ExperimentalItemModel.classes_id,
                'start_time': et.ExperimentalTaskModel.start_time,
                'dead_line': et.ExperimentalTaskModel.dead_line,
                'content': et.ExperimentalTaskModel.content,
                'file': et.ExperimentalTaskModel.file,
                'description': et.ExperimentalTaskModel.description,
                'deleted': et.ExperimentalTaskModel.deleted,
                'create_time': et.ExperimentalTaskModel.create_time
            }, rets)
        finally:
            self._db.close()
        return ets

    def update(self, experimental_task_id, experimental_task_name=None, start_time=None, dead_line=None, content=None, file=None, description=None):
        flag = -1
        mp = {}
        if experimental_task_name is not None:
            mp['name'] = experimental_task_name
        if start_time is not None:
            mp['start_time'] = start_time
        if dead_line is not None:
            mp['dead_line'] = dead_line
        if content is not None:
            mp['content'] = content
        if file is not None:
            mp['file'] = file
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(ExperimentalTaskModel).filter(ExperimentalTaskModel.id == experimental_task_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, experimental_task_id):
        flag = -1
        try:
            self._db.query(ExperimentalTaskModel).filter(ExperimentalTaskModel.id == experimental_task_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag