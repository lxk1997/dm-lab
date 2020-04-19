BUFFER_SIZE = 20 * 1000 * 1000

class BaseFileSystem(object):
    def __init__(self, buffer_size=None):
        self._buffer_size = buffer_size if buffer_size is not None else BUFFER_SIZE

    @property
    def is_open(self):
        raise NotImplementedError

    def close(self):
        raise NotImplementedError

    def join(self, *args):
        raise NotImplementedError

    def splitext(self, path):
        raise NotImplementedError

    def dirname(self, path):
        raise NotImplementedError

    def isfile(self, path):
        raise NotImplementedError

    def isdir(self, path):
        raise NotImplementedError
    
    def exists(self, path):
        raise NotImplementedError

    def listdir(self, path):
        raise NotImplementedError

    def walk(self, path):
        raise NotImplementedError

    def mkdir(self, path):
        raise NotImplementedError

    def makedirs(self, path):
        raise NotImplementedError

    def open(self, path, mode='rb'):
        raise NotImplementedError

    def remove(self, path):
        raise NotImplementedError

    def removedirs(self, path):
        raise NotImplementedError

    def rmtree(self, path):
        raise NotImplementedError

    def uploadtree(self, src, dst):
        raise NotImplementedError

    def downloadtree(self, src, dst):
        raise NotImplementedError

    def save(self, path, file_obj):
        with self.open(path, 'wb') as fout:
            while True:
                content = file_obj.read(self._buffer_size)
                if content:
                    fout.write(content)
                else:
                    break
        file_obj.seek(0)

    def listing(self, path, only_file=False):
        for cur_path, dirs, files in self.walk(path):
            files.sort()
            if not only_file:
                rdir = self.relpath(cur_path, path)
                yield rdir
            for fname in files:
                fpath = self.join(cur_path, fname)
                rpath = self.relpath(fpath, path)
                yield rpath
