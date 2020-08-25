class Handwriting {
  constructor(canvas, lineWidth) {
    this.canvas = canvas;
    this.cxt = canvas.getContext('2d');
    this.cxt.lineCap = 'round';
    this.cxt.lineJoin = 'round';
    this.lineWidth = lineWidth || 3;
    this.width = canvas.width;
    this.height = canvas.height;
    this.drawing = false;
    this.handwritingX = [];
    this.handwritingY = [];
    this.trace = [];
    this.options = {};
    this.step = [];
    this.redo_step = [];
    this.redo_trace = [];
    this.allowUndo = false;
    this.allowRedo = false;
    this.timer = null;
    this.callback = null;
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
    this.canvas.addEventListener('touchstart', this.touchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.touchMove.bind(this));
    this.canvas.addEventListener('touchend', this.touchEnd.bind(this));
  }

  /**
   * [toggle_Undo_Redo description]
   * @return {[type]} [description]
   */
  set_Undo_Redo(undo, redo) {
    this.allowUndo = undo;
    this.allowRedo = undo ? redo : false;
    if (!this.allowUndo) {
      this.step = [];
      this.redo_step = [];
      this.redo_trace = [];
    }
  }

  setLineWidth(lineWidth) {
    this.lineWidth = lineWidth;
  }

  setCallBack(callback) {
    this.callback = callback;
  }

  setOptions(options) {
    this.options = options;
  }

  mouseDown(e) {
    // new stroke
    this.cxt.lineWidth = this.lineWidth;
    this.handwritingX = [];
    this.handwritingY = [];
    this.drawing = true;
    this.cxt.beginPath();
    var rect = this.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    this.cxt.moveTo(x, y);
    this.handwritingX.push(x);
    this.handwritingY.push(y);

    //清楚自动识别计时器
    if (this.timer) clearTimeout(this.timer);
  }

  mouseMove(e) {
    if (this.drawing) {
      var rect = this.canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      this.cxt.lineTo(x, y);
      this.cxt.stroke();
      this.handwritingX.push(x);
      this.handwritingY.push(y);
    }
  }

  mouseUp() {
    var w = [];
    w.push(this.handwritingX);
    w.push(this.handwritingY);
    w.push([]);
    this.trace.push(w);
    this.drawing = false;
    if (this.allowUndo) this.step.push(this.toDataURL());

    //启动自动识别计算器，500毫秒后自动识别
    this.timer = setTimeout(() => {
      this.recognize();
    }, 500);
  }

  touchStart(e) {
    e.preventDefault();
    this.cxt.lineWidth = this.lineWidth;
    this.handwritingX = [];
    this.handwritingY = [];
    var de = document.documentElement;
    var box = this.getBoundingClientRect();
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    var touch = e.changedTouches[0];
    var touchX = touch.pageX - left;
    var touchY = touch.pageY - top;
    this.handwritingX.push(touchX);
    this.handwritingY.push(touchY);
    this.cxt.beginPath();
    this.cxt.moveTo(touchX, touchY);

    //清楚自动识别计时器
    if (this.timer) clearTimeout(this.timer);
  }

  touchMove(e) {
    e.preventDefault();
    var touch = e.targetTouches[0];
    var de = document.documentElement;
    var box = this.getBoundingClientRect();
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    var x = touch.pageX - left;
    var y = touch.pageY - top;
    this.handwritingX.push(x);
    this.handwritingY.push(y);
    this.cxt.lineTo(x, y);
    this.cxt.stroke();
  }

  touchEnd(e) {
    var w = [];
    w.push(this.handwritingX);
    w.push(this.handwritingY);
    w.push([]);
    this.trace.push(w);
    if (this.allowUndo) this.step.push(this.toDataURL());

    //启动自动识别计算器，500毫秒后自动识别
    this.timer = setTimeout(() => {
      this.recognize();
    }, 500);
  }

  undo() {
    if (!this.allowUndo || this.step.length <= 0) return;
    else if (this.step.length === 1) {
      if (this.allowRedo) {
        this.redo_step.push(this.step.pop());
        this.redo_trace.push(this.trace.pop());
        this.cxt.clearRect(0, 0, this.width, this.height);
      }
    } else {
      if (this.allowRedo) {
        this.redo_step.push(this.step.pop());
        this.redo_trace.push(this.trace.pop());
      } else {
        this.step.pop();
        this.trace.pop();
      }
      this.loadFromUrl(this.step.slice(-1)[0]);
    }
  }

  redo() {
    if (!this.allowRedo || this.redo_step.length <= 0) return;
    this.step.push(this.redo_step.pop());
    this.trace.push(this.redo_trace.pop());
    this.loadFromUrl(this.step.slice(-1)[0]);
  }

  erase() {
    this.cxt.clearRect(0, 0, this.width, this.height);
    this.step = [];
    this.redo_step = [];
    this.redo_trace = [];
    this.trace = [];
  }

  loadFromUrl(url) {
    var imageObj = new Image();
    imageObj.onload = function () {
      this.canvas.cxt.clearRect(0, 0, this.width, this.height);
      this.canvas.cxt.drawImage(imageObj, 0, 0);
    };
    imageObj.src = url;
  }

  recognize() {
    var data = JSON.stringify({
      options: 'enable_pre_space',
      requests: [
        {
          writing_guide: {
            writing_area_width: this.options.width || this.width || undefined,
            writing_area_height: this.options.height || this.width || undefined
          },
          ink: this.trace,
          language: this.options.language || 'zh_CN'
        }
      ]
    });

    var _this = this;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        switch (this.status) {
          case 200:
            var response = JSON.parse(this.responseText);
            var results;
            if (response.length === 1) {
              console.log(new Error(response[0]));
            } else {
              //识别成功清除画板
              _this.erase();

              results = response[1][0][1];
            }
            if (!!_this.options.numOfWords) {
              results = results.filter(function (result) {
                return result.length === _this.options.numOfWords;
              });
            }
            if (_this.options && !!_this.options.numOfReturn) {
              results = results.slice(0, this.options.numOfReturn);
            }
            _this.callback(results, undefined);
            break;
          case 403:
            _this.callback(undefined, new Error('access denied'));
            break;
          case 503:
            _this.callback(
              undefined,
              new Error("can't connect to recognition server")
            );
            break;
          default:
        }
      }
    });
    xhr.open(
      'POST',
      'https://www.google.cn/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8'
    );
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);
  }
}

export default Handwriting;
