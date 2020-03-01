from ..db import get_db
from ..models import ClassesModel, DatasetModel


class Dataset:
    def __init__(self):
        self._db = get_db()

    def create(self, dataset_name, experimental_item_id, file_key, deleted=0, description=None):
        dataset = DatasetModel(name=dataset_name, experimental_item_id=experimental_item_id, file_key=file_key, deleted=deleted, description=description)
        try:
            self._db.add(dataset)
            self._db.commit()
            d_id = dataset.id
        except:
            self._db.rollback()
            d_id = -1
        finally:
            self._db.close()
        return d_id

    def query(self, dataset_id=None, dataset_name=None, experimental_item_id=None, file_key=None, deleted=0, description=None, limit=None, offset=None):
        try:
            query = self._db.query(DatasetModel)
            if dataset_id is not None:
                query = query.filter(DatasetModel.id == dataset_id)
            if dataset_name is not None:
                query = query.filter(DatasetModel.name == dataset_name)
            if experimental_item_id is not None:
                query = query.filter(DatasetModel.experimental_item_id == experimental_item_id)
            if file_key is not None:
                query = query.filter(DatasetModel.file_key == file_key)
            if description is not None:
                query = query.filter(DatasetModel.description == description)
            query = query.filter(DatasetModel.deleted == deleted)
            query = query.order_by(DatasetModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            datasets = map(lambda d: {
                'dataset_id': d.id,
                'dataset_name': d.name,
                'experimental_item_id': d.experimental_item_id,
                'file_key': d.file_key,
                'deleted': d.deleted,
                'description': d.description,
                'create_time': d.create_time
            }, rets)
        finally:
            self._db.close()
        return datasets

    def update(self, dataset_id, dataset_name=None, description=None):
        flag = -1
        mp = {}
        if dataset_name is not None:
            mp['name'] = dataset_name
        if description is not None:
            mp['description'] = description
        try:
            self._db.query(DatasetModel).filter(DatasetModel.id == dataset_id).update(mp)
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag

    def delete(self, dataset_id):
        flag = -1
        try:
            self._db.query(DatasetModel).filter(DatasetModel.id == dataset_id).update({'deleted': 1})
            self._db.commit()
            flag = 1
        except:
            self._db.rollback()
        finally:
            self._db.close()
        return flag





