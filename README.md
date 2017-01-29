# iLibrary iPad出借状态 - Django版本

<http://ilibrary.qcloudapps.com/>

爬取西安交通大学InnoPAC的网页，提取并进行整合iPad的出借状态，并给出统计信息

> 本仓库代码可以直接在[腾讯蓝鲸智云](http://bk.tencent.com/campus/developer-center/)部署

## 安装

### 本地安装

1. 要求`Python 2.x`, `Django 1.8.x`
2. 直接即可运行

### 腾讯蓝鲸智云部署

1. 访问<http://bk.tencent.com/campus/developer-center/>
2. 新建应用，并进行`SVN Checkout` `trunk`
3. 直接删除`trunk`的所有数据，将本仓库的`master`分支文件解压到该文件夹
4. 执行`SVN Commit`，在腾讯蓝鲸智云页面一键部署应用即可

### 子应用方式安装

1. 要求`Python 2.x`, `Django 1.8.x`

2. 复制`ipadstatus`文件夹和`static/ipadstatus`到Django工程中合适目录

    ```python
    # settings.py
    INSTALLED_APPS = (
        // ...
        'ipadstatus',
    )
    ```

    ```python
    # urls.py
    urlpatterns = [
        // ...
        url(r'^ipadstatus/', include('ipadstatus.urls')),
    ]
    ```

## 说明

* 本应用全部使用了Django内置功能，所以不需要蓝鲸框架提供的任何东西，只是利用其作为Django云平台

* 目前共爬取5个页面

    | 条码     | 页面内包含设备   |
    | :------- | :--------------- |
    | ipad     | iPad 1-25,36-40  |
    | ipad0083 | iPad 26-35,41-83 |
    | mini     | iPad mini 1-53   |
    | mini0057 | iPad mini 54-57  |
    | imac     | iMac 共11台      |

## 程序执行流程

1. 爬取：`http://innopac.lib.xjtu.edu.cn/search~S3*chx?/c//,,,/holdings&b` + `条码`
2. 正则提取取表格中的内容
3. ajax返回json给前端
4. 前端分类并进行展示

## 以前的php版本的时间信息

* 2015年12月21日 v1.0
* 2016年01月01日 v2.0
* 2016年05月17日 v3.0
* 2016年07月13日 v3.1
* 2016年12月28日 v4.0

## LICENSE

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
