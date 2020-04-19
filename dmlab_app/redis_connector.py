import redis
from flask import current_app

def get_redis():
    if not hasattr(current_app, 'redis_pool'):
        current_app.redis_pool = redis.ConnectionPool(
                decode_responses=True,
                **current_app.config['REDIS']
                )
    pool = current_app.redis_pool
    return redis.StrictRedis(connection_pool=pool)
