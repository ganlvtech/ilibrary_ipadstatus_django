from django.http import JsonResponse
from django.shortcuts import render

from .models import IPadStatus


def index(request):
    return render(request, 'ipadstatus/index.html')


def data(request):
    status = IPadStatus(('ipad', 'ipad0083', 'mini', 'mini0057', 'imac',))
    return JsonResponse({
        'data': status.data,
        'msg': {
            'level': status.level,
            'content': status.msg,
        },
    })
