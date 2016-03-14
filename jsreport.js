/* globals jsreportInit define */
/* eslint-env browser */

;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.jsreport = factory()
}(this, function () {
  'use strict'

  function JsReport () {
    this.options = {}
    this.headers = this.headers || {}
  }

  function _serverSideRender (request, placeholder) {
    var frameName = placeholder || '_blank'

    if (placeholder && (placeholder !== '_blank' && placeholder !== '_top' && placeholder !== '_parent' && placeholder !== '_self')) {
      if (typeof placeholder === 'string' || placeholder instanceof String) {
        var contentIframe = document.getElementById('contentIframe')
        if (contentIframe) {
          var contentIframeDoc = contentIframe.contentDocument || contentIframe.contentWindow.document
          placeholder = contentIframeDoc.getElementById(placeholder)
        } else {
          placeholder = document.getElementById(placeholder)
        }
      }

      if (placeholder.length) {
        placeholder = placeholder[0]
      }

      frameName = request.template.shortid || new Date().getTime()

      var iframe = "<iframe frameborder='0' name='" + frameName + "' style='width:100%;height:100%;z-index:50'></iframe>"
      placeholder.innerHTML = iframe
    }

    var mapForm = document.createElement('form')
    mapForm.target = frameName
    mapForm.id = new Date().getTime()
    mapForm.method = 'POST'
    mapForm.action = this.serverUrl + '/api/report'

    function addInput (form, name, value) {
      var input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    function addBody (path, body) {
      if (body === null || body === undefined) {
        return
      }

      for (var key in body) {
        if (body[key] && Object.prototype.toString.call(body[key]) === '[object Object]') {
          addBody(path + '[' + key + ']', body[key])
        } else {
          if (body[key] !== null && body[key] !== undefined && !(body[key] instanceof Array)) {
            addInput(mapForm, path + '[' + key + ']', body[key])
          }
        }
      }
    }

    addBody('template', request.template)

    if (request.options != null) {
      addBody('options', request.options)
    }

    if (request.data) {
      addBody('data', request.data)
    }

    var headers = this.headers
    headers['host-cookie'] = document.cookie
    addBody('headers', headers)

    document.body.appendChild(mapForm)

    function submit (i) {
      if (i > 10) {
        return console.log('Unable to submit render form.')
      }
      try {
        mapForm.submit()
        mapForm.outerHTML = ''
      } catch (e) {
        setTimeout(function () {
          submit(i + 1)
        }, 50)
      }
    }

    submit(0)
  }

  function _render (placeholder, request) {
    var self = this

    if (!this.serverUrl) {
      throw new Error('The script was not linked from jsreport. You need to fill jsreport.serverUrl property with valid url to jsreport server.')
    }

    if (!request) {
      request = placeholder
      placeholder = '_blank'
    }

    if (typeof request === 'string' || request instanceof String) {
      request = {
        template: {shortid: request}
      }
    }

    if (!request.template) {
      request = {template: request}
    }

    _serverSideRender.call(self, request, placeholder)
  }

  function _renderAsync (request) {
    if (!this.serverUrl) {
      throw new Error('The script was not linked from jsreport. You need to fill jsreport.serverUrl property with valid url to jsreport server.')
    }

    if (!request.template) {
      request = {template: request}
    }

    var xhr = new XMLHttpRequest()
    var data = JSON.stringify(request)
    xhr.open('POST', this.serverUrl + '/api/report', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.responseType = 'arraybuffer'

    var PromiseImpl = this.promise || window.Promise || undefined

    if (!PromiseImpl) {
      throw new Error('Native Promise is not supported in this browser. Use jsreport.Promise = bluebirdOrAnyOtherLib;')
    }

    return new PromiseImpl(function (resolve, reject) {
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response)
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          })
        }
      }

      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
      }

      xhr.send(data)
    })
  }

  JsReport.prototype = {
    render: function (placeholder, request) {
      return _render.call(this, placeholder, request)
    },

    download: function (filename, request) {
      request.options = request.options || {}
      request.options['Content-Disposition'] = 'attachment;filename=' + filename
      return _render.call(this, '_self', request)
    },

    renderAsync: function (request) {
      return _renderAsync.call(this, request)
    }
  }

  var jsreportInstance = new JsReport()

  setTimeout(function () {
    if (window.jsreportInit !== undefined) {
      jsreportInit(jsreportInstance)
    }
  }, 0)

  var assign = Object.assign
  // polyfill for Object.assign
  if (!assign) {
    (function () {
      assign = function (target) {
        'use strict'
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }

        var output = Object(target)
        for (var index = 1; index < arguments.length; index++) {
          var source = arguments[index]
          if (source !== undefined && source !== null) {
            for (var nextKey in source) {
              if (source.hasOwnProperty(nextKey)) {
                output[nextKey] = source[nextKey]
              }
            }
          }
        }
        return output
      }
    })()
  }

  if (window.jsreport) {
    Object.assign(jsreportInstance, window.jsreport)
  }

  return jsreportInstance
}))

