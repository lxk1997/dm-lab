import os
import shutil
from .base import BaseFileSystem

class LocalFileSystem(BaseFileSystem):
    def __init__(self, prefix='/', buffer_size=None):
        super(LocalFileSystem, self).__init__(buffer_size=buffer_size)
        self._prefix = prefix if prefix.endswith('/') else prefix + '/'

    def _full_path(self, path):
        return self._prefix + path

    def _rel_path(self, full_path):
        return os.path.relpath(full_path, self._prefix)

    @property
    def is_open(self):
        return True

    def close(self):
        pass

    def abs_path(self, path):
        return self._prefix + path

    def join(self, *args):
        return '/'.join(args)

    def splitext(self, path):
        return os.path.splitext(path)

    def dirname(self, path):
        return os.path.dirname(path)

    def relpath(self, path, start='.'):
        return os.path.relpath(self._full_path(path), self._full_path(start))

    def isfile(self, path):
        return os.path.isfile(self._full_path(path))

    def isdir(self, path):
        return os.path.isdir(self._full_path(path))

    def exists(self, path):
        return os.path.exists(self._full_path(path))

    def mkdir(self, path):
        return os.mkdir(self._full_path(path))

    def makedirs(self, path):
        return os.makedirs(self._full_path(path))

    def open(self, path, mode='rb'):
        return open(self._full_path(path), mode=mode)

#    def save(self, path, fid):
#        assert not self.exists(self._full_path(path))
#        with self.open(path, 'rb') as fout:
#            fout.writelines(fid)
#        fid.seek(0)

    def remove(self, path):
        return os.remove(self._full_path(path))

#    def removedirs(self, path):
#        return os.removedirs(self._full_path(path))

    def rmtree(self, path):
        return shutil.rmtree(self._full_path(path))

    def listdir(self, path):
        return os.listdir(self._full_path(path))

    def walk(self, path):
        for dirpath, dirnames, filenames in os.walk(self._full_path(path)):
            r_dirpath = self._rel_path(dirpath)
            yield r_dirpath, dirnames, filenames

    def uploadtree(self, src, dst):
        return shutil.copytree(src, self._full_path(dst))

    def downloadtree(self, src, dst):
        return shutil.copytree(self._full_path(src), dst)
