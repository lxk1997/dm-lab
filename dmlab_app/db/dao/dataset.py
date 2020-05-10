from sqlalchemy import func

from ..db import get_db
from ..models import ClazzModel, DatasetModel, ExperimentalItemModel


class Dataset:
    def __init__(self):
        self._db = get_db()

    def create(self, dataset_name, experimental_item_id, file_key, deleted=0, description=None, user_only=0, user_id=None):
        dataset = DatasetModel(name=dataset_name, experimental_item_id=experimental_item_id, file_key=file_key, deleted=deleted, description=description, user_id=user_id, user_only=user_only)
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

    def query(self, dataset_id=None, dataset_name=None, experimental_item_id=None, file_key=None, user_only=None, user_id=None, deleted=0, description=None, limit=None, offset=None):
        try:
            query = self._db.query(DatasetModel, ExperimentalItemModel).filter(DatasetModel.experimental_item_id == ExperimentalItemModel.id, ExperimentalItemModel.deleted == 0)
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
            if user_only is not None:
                query = query.filter(DatasetModel.user_only == user_only)
            if user_id is not None:
                query = query.filter(DatasetModel.user_id == user_id)
            query = query.filter(DatasetModel.deleted == deleted)
            query = query.order_by(DatasetModel.create_time.desc())
            if limit is not None:
                query = query.limit(limit)
                if offset is not None:
                    query = query.offset(offset)
            rets = query.all()
            datasets = list(map(lambda d: {
                'dataset_id': d.DatasetModel.id,
                'dataset_name': d.DatasetModel.name,
                'experimental_item_id': d.DatasetModel.experimental_item_id,
                'file_key': d.DatasetModel.file_key,
                'user_id': d.DatasetModel.user_id,
                'user_only': d.DatasetModel.user_only,
                'deleted': d.DatasetModel.deleted,
                'description': d.DatasetModel.description,
                'create_time': d.DatasetModel.create_time.strftime("%Y-%m-%d  %H:%M:%S")
            }, rets))
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

    def get_count(self, experimental_item_id):
        try:
            count = self._db.query(func.count(DatasetModel.id)).filter(DatasetModel.experimental_item_id == experimental_item_id, DatasetModel.deleted == 0).first()[0]
        finally:
            self._db.close()
        return count





