import os
from io import BytesIO
from pyarrow import hdfs
from .base import BaseFileSystem

def _listing(root):
    for path, dirs, files in os.walk(root, followlinks=True):
        dirs.sort()
        files.sort()
        for fname in files:
            fpath = os.path.join(path, fname)
            suffix = os.path.splitext(fname)[1].lower()
            if os.path.isfile(fpath):
                rpath = os.path.relpath(fpath, root)
                yield rpath

class HDFSFileSystem(BaseFileSystem):
    def __init__(self, host, prefix='/', buffer_size=None):
        super(HDFSFileSystem, self).__init__(buffer_size=buffer_size)
        self._host = host if not host.endswith('/') else host[:-1]
        self._prefix = prefix if prefix.endswith('/') else prefix + '/'
        self._client = hdfs.connect(self._host)

    def close(self):
        return self._client.close()

    @property
    def is_open(self):
        return self._client.is_open

    def _full_path(self, path):
        return self._prefix + path

    def _rel_path(self, full_path):
        return os.path.relpath(full_path, self._prefix)

    def join(self, *args):
        return '/'.join(args)

    def splitext(self, path):
        return os.path.splitext(path)

    def dirname(self, path):
        return os.path.dirname(path)

    def relpath(self, path, start):
        return os.path.relpath(self._full_path(path), self._full_path(start))

    def isfile(self, path):
        return self._client.isfile(self._full_path(path))

    def isdir(self, path):
        return self._client.isdir(self._full_path(path))
    
    def exists(self, path):
        return self._client.exists(self._full_path(path))

    def listdir(self, path):
        if self.isdir(os.path.dirname(path)):
            full_path = self._full_path(path)
            full_path = full_path if full_path.endswith('/') else full_path + '/'
            path_list = self._client.ls(full_path)
            return map(lambda p: p[len(self._host+full_path):], path_list)
        elif self.isfile(path):
            raise OSError("Not a directory: '%s'" % path)
        else:
            raise OSError("No such file or directory: '%s'" % path)

    def walk(self, path):
        for dirpath, dirnames, filenames in self._client.walk(self._full_path(path)):
            r_dirpath = self._rel_path(dirpath)
            yield r_dirpath, dirnames, filenames

    def mkdir(self, path):
        raise NotImplementedError

    def makedirs(self, path):
        return self._client.mkdir(self._full_path(path))

    def open(self, path, mode='rb'):
#       if self.isdir(path):
#            raise OSError("Is a directory: '%s'" % path)
#        elif 'r' in mode:
#            if not self.isfile(path):
#                raise OSError("No such file or directory: '%s'" % path)
#            else:
#                return BytesIO(self._client.open(self._full_path(path), mode).read())
        if 'r' in mode:
            return BytesIO(self._client.open(self._full_path(path), mode).read())
        else:
            return self._client.open(self._full_path(path), mode)

    def remove(self, path):
        if self.isfile(path):
            return self._client.rm(self._full_path(path))
        elif self.isdir(path):
            raise OSError("Is a directory: '%s'" % path)
        else:
            raise OSError("No such file or directory: '%s'" % path)

    def rmtree(self, path):
        if self.isdir(path):
            return self._client.rm(self._full_path(path), recursive=True)
        elif self.isfile(path):
            raise OSError("Not a directory: '%s'" % path)
        else:
            raise OSError("No such file or directory: '%s'" % path)

    def uploadtree(self, src, dst):
        for rpath in _listing(src):
            with open(os.path.join(src, rpath), 'rb') as fin:
                self.save(self.join(dst, rpath), fin)

    def downloadtree(self, src, dst):
        for rpath in self.listing(src, only_file=True):
            with self.open(self.join(src, rpath), 'rb') as fin:
                output_path = os.path.join(dst, rpath)
                output_dir = os.path.dirname(output_path)
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
                with open(output_path, 'wb') as fout:
                    fout.write(fin.read())
