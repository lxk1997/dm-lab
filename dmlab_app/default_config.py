SECRET_KEY = 'DM-LAB'

REDIS = {
        'host'      : '127.0.0.1',
        'port'      : 6379,
        'password'  : '123456',
        'db': 1
    }

PGDB = {
        'host'      : '127.0.0.1',
        'port'      : 5432,
        'username'  : 'demo',
        'password'  : '123456',
        'database'  : 'demo'
   }
FS = {
        'mode'      : 'local',
        'config'    : {
                'prefix': '/demo/fs'
        },
    }

TMP = {
        'prefix'    : '/demo/tmp',
   }

SESSION_TYPE = 'redis'
SESSION_PERMANENT = True
SESSION_USE_SIGNER = True
SESSION_KEY_PREFIX = 'session:'
PERMANENT_SESSION_LIFETIME = 86400
CELERY_FLOWER_HOST = 'http://127.0.0.1:8000'
CELERY_BROKER_URL = 'redis://:123456@127.0.0.1:6379/1'
CELERY_RESULT_BACKEND = 'redis://:123456@127.0.0.1:6379/1'
CELERYD_CONCURRENCY = 2
ELERYD_MAX_TASKS_PER_CHILD = 1
BROKER_POOL_LIMIT = None
CELERYD_PREFETCH_MULTIPLIER = 1
FILE_CLIENT_HOST = 'http://127.0.0.1:8001'
FILE_CLIENT_TMP_DIR = '/demo/tmp'
FILE_CLIENT_MAX_CHUNK_SIZE = 4 * 10**9
