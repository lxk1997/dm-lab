from dmlab_app.task.association_rule.apriori import Apriori
from dmlab_app.task.association_rule.customized import CustomizedAssociationRule
from dmlab_app.task.classification.cart_classifier import CARTClassifier
from dmlab_app.task.classification.customized import CustomizedClassifier
from dmlab_app.task.classification.knn_classifier import KNNClassifier
from dmlab_app.task.classification.lr_classifier import LRClassifier
from dmlab_app.task.classification.nb_classifier import NBClassifier
from dmlab_app.task.classification.svm_classifier import SVMClassifier
from dmlab_app.task.data_preprocessing.duplicate_removal import DuplicateRemoval
from dmlab_app.task.io_source.input_source import InputSource
from dmlab_app.task.io_source.output_source import OutputSource
from dmlab_app.task.regression.cart_regressor import CARTRegressor
from dmlab_app.task.regression.customized import CustomizedRegressor

_tasks = [
        {
            'id'        : 1,
            'name'      : 'Input Source',
            'method'    : InputSource(),
        },
        {
            'id'        : 2,
            'name'      : 'Output Source',
            'method'    : OutputSource(),
        },
        {
            'id'        : 3,
            'name'      : 'Duplicate Removal',
            'method'    : DuplicateRemoval(),
        },
        {
            'id'        : 4,
            'name'      : 'CART Classifier',
            'method'    : CARTClassifier(),
        },
        {
            'id'        : 5,
            'name'      : 'SVM Classifier',
            'method'    : SVMClassifier(),
        },
        {
            'id'        : 6,
            'name'      : 'KNN Classifier',
            'method'    : KNNClassifier(),
        },
        {
            'id'        : 7,
            'name'      : 'NB Classifier',
            'method'    : NBClassifier(),
        },
        {
            'id'        : 8,
            'name'      : 'LR Classifier',
            'method'    : LRClassifier(),
        },
        {
            'id'        : 9,
            'name'      : 'CART Regressor',
            'method'    : CARTRegressor(),
        },
        {
            'id'        : 10,
            'name'      : 'Apriori',
            'method'    : Apriori(),
        },
    ]

_customized_tasks = [
        {
            'id'        : 1,
            'name'      : 'Association Rule',
            'method'    : CustomizedAssociationRule(),
        },
        {
            'id'        : 2,
            'name'      : 'Classification',
            'method'    : CustomizedClassifier(),
        },
        {
            'id'        : 3,
            'name'      : 'Regression',
            'method'    : CustomizedRegressor(),
        },
]

assert len(_tasks) == len(set(map(lambda t: t['id'], _tasks)))

_task_method_map = {str(task['id']): task['method'] for task in _tasks}

_customized_task_method_map = {task['id']: task['method'] for task in _customized_tasks}

_task_method_name_map = {str(task['name']): task['method'] for task in _tasks}

def query_task(task_id=None, task_name=None, limit=None, offset=None):
    tasks = map(lambda task: {'task_id': task['id'], 'task_name': task['name']}, _tasks)
    if task_id is not None:
        tasks = filter(lambda task: str(task['task_id'])==str(task_id), tasks)
    if task_name is not None:
        tasks = filter(lambda task: task['task_name']==task_name, tasks)
    limit = len(tasks) if limit is None else int(limit)
    offset = 0 if offset is None else int(offset)
    return tasks[offset:offset+limit]


def get_task_method(task_name):
    if task_name in _task_method_name_map.keys():
        return _task_method_name_map[task_name]
    return None


def get_customized_task_method(task_id):
    return _customized_task_method_map[task_id]
