/**
 * IPadStatus构造器
 * @param {Array} data 服务器传回的iPad状态的原始数据
 * @constructor
 */
function IPadStatus(data) {
    /**
     * 馆藏地 -> 设备类型
     * @param {string} site 馆藏地
     * @return {string} 设备类型
     */
    var siteToType = function (site) {
        if (site.search('iLibrary Space2') === 0) { // 这个匹配IPAD的必须放在下一个匹配IMAC的之前
            return 'IPAD';
        } else if (site.search('iLibrary Space') === 0) {
            return 'IMAC';
        } else if (site.search('PBL') === 0) {
            return 'PBL';
        } else if (site.search('MINI') === 0) {
            return 'MINI';
        }
        return site;
    };
    /**
     * 原始设备状态 -> 到期日期
     * @param {string} rawState 原始设备状态
     * @returns {string} 到期日期：'yy-mm-dd'，例如：'17-01-01'；如果没有日期，则返回空字符串
     */
    var rawStateToDate = function (rawState) {
        var matches = rawState.match(/\d+-\d+-\d+/);
        if (matches) {
            return matches[0];
        }
        return '';
    };
    /**
     * 原始设备状态 -> 设备状态（去除日期）
     * @param {string} rawState 原始设备状态
     * @returns {string} 设备状态（去除日期）
     */
    var rawStateToState = function (rawState) {
        if (rawState.search('在架上') >= 0) {
            return '在架上';
        } else if (rawState.search('在预约架上') >= 0) {
            return '在预约架上';
        } else if (rawState.search('到期') >= 0) {
            return '到期';
        } else if (rawState.search('修补中') >= 0) {
            return '修补中';
        } else if (rawState.search('IN TRANSIT') >= 0) {
            return 'IN TRANSIT';
        }
        return rawState.replace(/\d+-\d+-\d+/, '').trim();
    };
    /**
     * 原始设备状态 -> 附加信息
     * @param {string} rawState 原始设备状态
     * @returns {string} 附加信息
     */
    var rawStateToMsg = function (rawState) {
        return rawState.replace(/\d+-\d+-\d+/, '').replace(/在架上|在预约架上|到期|修补中|IN TRANSIT/, '').trim();
    };
    /**
     * 原始设备状态 -> 友好的设备状态
     * @param {string} rawState 原始设备状态
     * @returns {string} 友好的设备状态，例如：'超期！', '今日到期', '明日到期'
     */
    var rawStateToFriendlyState = function (rawState) {
        var state = rawStateToState(rawState);
        var date = rawStateToDate(rawState);
        if (state.search('到期') >= 0 && date) {
            var remain = Date.parse('20' + date + ' 21:30') - Date.now();
            if (remain < 0) {
                return '超期！';
            } else if (remain < 21.5 * 3600000) {
                return '今日到期';
            } else if (remain < (24 + 21.5) * 3600000) {
                return '明日到期';
            }
        }
        return state;
    };
    /**
     * 友好的设备状态 -> 颜色类名
     * @param {string} friendlyState 友好的设备状态
     * @returns {string} 颜色类名，例如：'danger', 'warning', 'info', 'success'
     */
    var friendlyStateToClassName = function (friendlyState) {
        switch (friendlyState) {
            case '超期！':
                return 'danger';
            case '今日到期':
                return 'warning';
            case '明日到期':
                return 'info';
            case '在架上':
                return 'success';
            default:
                return '';
        }
    };
    this.data = data;
    for (var i = 0; i < this.data.length; ++i) {
        var item = this.data[i];
        item.type = siteToType(item.site);
        item.rawState = item.state;
        item.date = rawStateToDate(item.rawState);
        item.state = rawStateToState(item.rawState);
        item.msg = rawStateToMsg(item.rawState);
        item.friendlyState = rawStateToFriendlyState(item.rawState);
        item.className = friendlyStateToClassName(item.friendlyState);
        item.classAttribute = item.className ? (' class="' + item.className + '"') : '';
        item.fullText = item.type + item.id + item.site + item.rawState + item.friendlyState;
    }
}
/**
 * iPad状态数据按id排序
 */
IPadStatus.prototype.sortById = function () {
    this.data.sort(function (a, b) {
        return a.id.localeCompare(b.id);
    });
};
/**
 * iPad状态数据按状态、到期日期、id排序
 */
IPadStatus.prototype.sortByStateDate = function () {
    this.data.sort(function (a, b) {
        var result;
        if ((result = a.state.localeCompare(b.state)) != 0) {
            return result;
        }
        if ((result = a.date.localeCompare(b.date)) != 0) {
            return result;
        }
        return a.id.localeCompare(b.id);
    });
};
/**
 * iPad状态数据按馆藏地、状态、到期日期、id排序
 */
IPadStatus.prototype.sortBySite = function () {
    this.data.sort(function (a, b) {
        var result;
        if ((result = a.site.toLowerCase().localeCompare(b.site.toLowerCase())) != 0) {
            return result;
        }
        if ((result = a.state.localeCompare(b.state)) != 0) {
            return result;
        }
        if ((result = a.date.localeCompare(b.date)) != 0) {
            return result;
        }
        return a.id.localeCompare(b.id);
    });
};
/**
 * 渲染指定部分数据
 * @param {Array} indices 指定部分的序号
 * @param {string} title 表格标题
 * @returns {string} 渲染后的HTML
 */
IPadStatus.prototype.view = function (indices, title) {
    var html = '\
<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-no-padding">\
    <div class="panel panel-default">\
        <div class="panel-heading"><span class="h6">' + title + '<span class="pull-right">共' + indices.length + '条记录</span></span></div>\
        <div class="table-responsive">\
            <table class="table table-bordered table-hover">\
                <thead>\
                    <tr>\
                        <td>类别</td>\
                        <td>条码</td>\
                        <td>状态</td>\
                    </tr>\
                </thead>\
                <tbody>';
    for (var i = 0; i < indices.length; ++i) {
        var item = this.data[indices[i]];
        html += '\
                    <tr' + item.classAttribute + '>\
                        <td width="20%">' + item.type + '</td>\
                        <td width="30%"><a href="http://innopac.lib.xjtu.edu.cn/search~S3*chx?/c//,,,/request&amp;b' + item.id.toLowerCase() + '" target="_blank">' + item.id + '</a></td>\
                        <td width="50%">' + item.friendlyState + ' ' + item.date + ' ' + item.msg + '</td>\
                    </tr>';
    }
    html += '\
                </tbody>\
                <tfoot>\
                    <tr>\
                        <td colspan="3" class="text-center">共' + indices.length + '条记录</td>\
                    </tr>\
                </tfoot>\
            </table>\
        </div>\
    </div>\
</div>';
    return html;
};
/**
 * 根据设备类型和状态匹配数据
 * @param {string} type 设备类型
 * @param {string} state 设备状态
 * @returns {Array} 匹配出的序号
 */
IPadStatus.prototype.match = function (type, state) {
    var indices = [];
    for (var i = 0; i < this.data.length; ++i) {
        var item = this.data[i];
        if (item.type.search(new RegExp(type, 'i')) >= 0 && item.state.search(new RegExp(state, 'i')) >= 0) {
            indices.push(i);
        }
    }
    return indices;
};
/**
 * 模糊匹配数据
 * @param {string} text 模糊匹配文本
 * @returns {Array} 匹配出的序号
 */
IPadStatus.prototype.search = function (text) {
    var indices = [];
    for (var i = 0; i < this.data.length; ++i) {
        if (this.data[i].fullText.search(new RegExp(text, 'i')) >= 0) {
            indices.push(i);
        }
    }
    return indices;
};
(function () {
    /**
     * 在页面上显示提示框
     * @param {string} msg 内容
     * @param {string} level 警告等级，例如：'danger', 'warning', 'info', 'success'
     */
    var showAlert = function (msg, level) {
        $('#alert').html('\
<div class="alert alert-' + level + '" role="alert">\
    ' + msg + ' <a href="javascript:" id="reload">刷新</a>\
</div>');
        $('#reload').on('click', function () {
            reload();
        });
    };
    /**
     * IPadStatus对象实例
     * @type {IPadStatus}
     */
    var iPadStatus;
    /**
     * 平滑滚动到页面顶部
     */
    var scorllToTop = function () {
        $('body').animate({scrollTop: 0}, 500);
    };
    /**
     * 设置主体部分内容
     * @param {string} title 标题
     * @param {string} html 主体部分HTML
     */
    var setContent = function (title, html) {
        $('#main').html(html);
        $('#title').text(title);
        scorllToTop();
    }
    /**
     * 更换为几种内置类型的内容
     * @param {string} type 显示类型，例如：'useful', 'IPAD', 'MINI', 'IMAC', 'PBL', 'all'
     * @return {boolean} 类型是否支持
     */
    var changeContentToDefault = function (type) {
        var title = '';
        var html = '';
        switch (type) {
            case 'useful':
                title = '常用设备状态';
                break;
            case 'IPAD':
                title = 'iLibrary iPad 设备状态';
                break;
            case 'MINI':
                title = 'iLibrary mini 设备状态';
                break;
            case 'IMAC':
                title = 'iLibrary iMac 设备状态';
                break;
            case 'PBL':
                title = 'PBL iPad 设备状态';
                break;
            case 'all':
                title = '所有设备状态';
                break;
            default:
                return false;
        }
        switch (type) {
            case 'useful':
                iPadStatus.sortByStateDate();
                html += iPadStatus.view(iPadStatus.match('IPAD', '在架上|在预约架上'), 'iPad 在架上');
                html += iPadStatus.view(iPadStatus.match('MINI', '在架上|在预约架上'), 'mini 在架上');
                html += iPadStatus.view(iPadStatus.match('IPAD', '到期'), 'iPad 已借出');
                html += iPadStatus.view(iPadStatus.match('MINI', '到期'), 'mini 已借出');
                break;
            case 'all':
                iPadStatus.sortBySite();
                html += iPadStatus.view(iPadStatus.match('', ''), '全部iPad（按分类序）');
                iPadStatus.sortById();
                html += iPadStatus.view(iPadStatus.match('', ''), '全部iPad（按序号序）');
                break;
            case 'IPAD':
            case 'MINI':
            case 'IMAC':
            case 'PBL':
                iPadStatus.sortByStateDate();
                html += iPadStatus.view(iPadStatus.match(type, '在架上|在预约架上'), type + ' 在架上');
                html += iPadStatus.view(iPadStatus.match(type, '到期'), type + ' 已借出');
                html += iPadStatus.view(iPadStatus.match(type, '修补中'), type + ' 修补中');
                html += iPadStatus.view(iPadStatus.match(type, 'IN TRANSIT'), type + ' IN TRANSIT');
                html += iPadStatus.view(iPadStatus.match(type, ''), type + ' 所有');
                break;
        }
        setContent(title, html);
        return true;
    };
    /**
     * 更换为搜索出的内容
     * @param {string} text 模糊匹配文本
     */
    var changeContentToSearch = function (text) {
        iPadStatus.sortByStateDate();
        setContent('设备状态搜索', iPadStatus.view(iPadStatus.search(text), '模糊搜索：' + text));
    };
    /**
     * 获取hash除去标识符以后的内容
     * @return {string}
     */
    var getHashContent = function () {
        return location.hash.replace(/^#?!?\/?/, '');
    };
    /**
     * hashchange事件处理
     */
    var onhashchange = function () {
        var hash = getHashContent();
        if (!hash) {
            location.hash = '#useful';
            return;
        }
        $('#sidebar li').removeClass("active");
        if (hash.search('s/') === 0) {
            changeContentToSearch(hash.slice(2));
            return;
        }
        if (changeContentToDefault(hash)) {
            $('a[href="#' + hash + '"]').closest('li').addClass("active");
            return;
        }
        changeContentToSearch(hash);
    };
    /**
     * 重新加载数据
     */
    var reload = function () {
        showAlert('加载中，请稍后...', 'info');
        $.ajax({
            type: 'get',
            url: 'data/',
            success: function (response) {
                iPadStatus = new IPadStatus(response.data);
                showAlert(response.msg.content, response.msg.level);
                onhashchange();
            },
            error: function () {
                showAlert('服务器无响应', 'danger');
            }
        });
    };
    $('#search').on('submit', function (e) {
        e.preventDefault();
        var text = $(this).find('input').val();
        if (!text) {
            location.hash = '#useful';
        } else {
            location.hash = '#s/' + $(this).find('input').val();
        }
        $('button[class="navbar-toggle"][aria-expanded="true"]').click();
    });
    $(window).on('hashchange', onhashchange);
    reload();
})();