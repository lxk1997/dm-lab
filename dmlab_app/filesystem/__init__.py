from .local import LocalFileSystem
from .hdfs import HDFSFileSystem

from flask import current_app, g

def get_fs(overwrite=False):
    if 'fs' not in g or overwrite:
        if current_app.config['FS']['mode'] == 'local':
            g.fs = LocalFileSystem(**current_app.config['FS']['config'])
        elif current_app.config['FS']['mode'] == 'hdfs':
            g.fs = HDFSFileSystem(**current_app.config['FS']['config'])
    if overwrite:
        print('overwrite fs')
    return g.fs

def get_tmp_dir():
    return current_app.config['TMP']['prefix']

def close_fs(e=None):
    fs = g.pop('fs', None)
    if fs is not None:
        fs.close()

def init_app(app):
    app.teardown_appcontext(close_fs)
