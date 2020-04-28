from dmlab_app.task.classification.cart_classifier import CARTClassifier
from dmlab_app.task.classification.svm_classifier import SVMClassifier
from dmlab_app.task.data_preprocessing.duplicate_removal import DuplicateRemoval
from dmlab_app.task.io_source.input_source import InputSource
from dmlab_app.task.io_source.output_source import OutputSource

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
    ]

assert len(_tasks) == len(set(map(lambda t: t['id'], _tasks)))

_task_method_map = {str(task['id']): task['method'] for task in _tasks}

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
    return _task_method_name_map[task_name]
