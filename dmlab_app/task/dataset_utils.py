import os


class DatasetUtils:
    def __init__(self, dataset_name=''):
        self._dataset_name = dataset_name
        self._header = []
        self._content = []

    def get_header(self):
        return self._header

    def get_content(self):
        return self._content

    def set_header(self, header):
        self._header = header

    def set_content(self, content):
        self._content = content

    def len_header(self):
        return len(self._header) if self._header else 0

    def len_content(self):
        return len(self._content) if self._content else 0

    def csv2obj(self, csv, file_name=None, sep=','):
        head_row = False
        if file_name:
            self._dataset_name = file_name
        for line in csv.readlines():
            if len(line.decode('utf-8').strip('\n')) == 0:
                continue
            if not head_row:
                self._header = line.decode('utf-8').strip('\n').split(sep)
                head_row = True
            else:
                self._content.append(line.decode('utf-8').strip('\n').split(sep))

    def obj2csv(self, output_dir, file_name=None, sep=','):
        file_name = file_name if file_name else self._dataset_name
        output_path = os.path.join(output_dir, file_name)
        if not os.path.isdir(output_dir):
            os.makedirs(output_dir)
        with open(output_path, 'wb') as fin:
            fin.write(sep.join(self._header) + '\n')
            for line in self._content:
                fin.write(sep.join(line) + '\n')

    def format_dict(self):
        rst = dict()
        rst['headers'] = self._header
        rst['content'] = self._content
        return rst



