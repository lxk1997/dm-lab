from ..db import get_db
from ..models import EvaluationFileModel


class EvaluationFile:
    def __init__(self):
        self._db = get_db()

    def create(self, evaluation_id, file_key, file_path, deleted=0):
        evaluation_file = EvaluationFileModel(evaluation_id=evaluation_id, file_key=file_key, file_path=file_path, deleted=deleted)
        try:
            self._db.add(evaluation_file)
            self._db.commit()
            ef_id = evaluation_file.id
        except:
            self._db.rollback()
            ef_id = -1
        finally:
            self._db.close()
        return ef_id

    def query(self, evaluation_id=None, file_key=None, file_path=None, deleted=0, limit=None, offset=None):
        try:
            query = self._db.query(EvaluationFileModel)
            if evaluation_id is not None:
                query = query.filter(EvaluationFileModel.evaluation_id == evaluation_id)
            if file_key is not None:
                query = query.filter(EvaluationFileModel.file_key == file_key)
            if file_path is not None:
                query = query.filter(EvaluationFileModel.file_path == file_path)
            query = query.filter(EvaluationFileModel.deleted == deleted)
            query = query.order_by(EvaluationFileModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            evaluation_files = list(map(lambda ef: {
                'evaluation_file_id': ef.id,
                'evaluation_id': ef.evaluation_id,
                'file_key': ef.file_key,
                'file_path': ef.file_path,
                'deleted': ef.deleted,
                'create_time': ef.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
        finally:
            self._db.close()
        return evaluation_files




