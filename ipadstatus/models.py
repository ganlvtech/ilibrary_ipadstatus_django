# coding=utf-8
import re
import urllib


class IPadStatus:
    def __init__(self, ipad_ids):
        """获取多组信息"""
        self.ipad_ids = ipad_ids
        self.msg = '获取实时数据成功'
        self.level = 'success'
        self.data = []
        for ipad_id in self.ipad_ids:
            one = IPadStatus.get(ipad_id)
            if not one:
                self.msg = '部分数据读取失败！'
                self.level = 'warning'
            else:
                self.data.extend(one)
        if not self.data:
            self.msg = '数据读取失败！'
            self.level = 'danger'

    @staticmethod
    def get(ipad_id):
        """获取InnoPAC中一个页面中的列表信息"""
        data = []
        try:
            html = urllib.urlopen("http://innopac.lib.xjtu.edu.cn/search~S3*chx?/c//,,,/holdings&b%s" % ipad_id).read()
        except:
            return data
        for regexp in (
                r'<!-- field 1 -->&nbsp;\s*?(\S.*?)\s*?\n[\s\S]+?browse">\s*?(\S.*?)\s*?</a>[\s\S]+?<!-- field % -->&nbsp;\s*?(\S.*?)\s*?</td>',
                r'<!-- field 1 -->&nbsp;\s*?(\S.*?)\s*?\n[\s\S]+?<!-- field C -->(.*?)<!-- field v -->[\s\S]+?<!-- field % -->&nbsp;\s*?(\S.*?)\s*?</td>'):
            if not data:
                for m in re.finditer(regexp, html):
                    data.append({
                        'id': m.group(2),
                        'site': m.group(1),
                        'state': m.group(3),
                    })
        return data
