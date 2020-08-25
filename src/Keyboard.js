import React from 'react';
import classnames from 'classnames';
import Handwriting from './handwriting';

import './keyboard.less';

class Keyboard extends React.Component {
  state = {
    visible: false,
    cursorPos: this.props.target.value ? this.props.target.value.length : 0,
    value: this.props.target.value || '',
    keyboardType: 0, //键盘类型0手写， 1字母， 2数字
    characters: [],
    letters: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'icon-keyboard dusky'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'icon-delete dusky'],
      [
        'icon-uppercase dusky',
        'z',
        'x',
        'c',
        'v',
        'b',
        'n',
        'm',
        '! dusky',
        '? dusky',
        '# dusky'
      ],
      [
        '~ dusky',
        '/ dusky',
        'icon-space space',
        '. dusky',
        ', dusky',
        '确定 confirm'
      ]
    ],
    upperCase: false
  };

  componentDidMount() {
    //光标位置移到最后
    const len = this.state.value.length;
    this.input.focus();
    this.input.setSelectionRange(len, len);

    //设置手写输入
    const drawboardRect = this.drawboard.getBoundingClientRect();
    this.drawboard.height = drawboardRect.height;
    this.drawboard.width = drawboardRect.width;
    const handwriting = new Handwriting(this.drawboard);

    const _this = this;
    //Set callback function
    handwriting.setCallBack(function(data, err) {
      if (err) {
        throw err;
      } else if (data && data.length > 0) {
        const value = _this.state.value;
        const cursorPos = _this.input.selectionEnd;
        _this.setState({
          value:
            value.substr(0, cursorPos) +
            data[0] +
            value.substr(cursorPos, value.length - 1),
          cursorPos: cursorPos + data[0].length,
          characters: data
        });

        const start = cursorPos;
        const end = cursorPos + data[0].length;
        _this.input.setSelectionRange(start, end);
      }
    });

    //显示键盘动画
    this.setState({ visible: true });

    //绑定键盘关闭事件到root
    setTimeout(() => {
      document
        .getElementById('root')
        .addEventListener('click', this.props.onClose, false);
    }, 500);
  }

  componentDidUpdate() {
    //输入框更新焦点位置
    const { cursorPos } = this.state;
    this.input.setSelectionRange(cursorPos, cursorPos);
  }

  componentWillUnmount() {
    //解除绑定到root的键盘关闭事件
    document
      .getElementById('root')
      .removeEventListener('click', this.props.onClose, false);
  }

  //切换
  handleSwitchKeyBoard = index => {
    this.setState({
      keyboardType: index,
      characters: []
    });
  };

  //备选汉字选择输入
  handleSelectCharacters = event => {
    const { value } = this.state;

    const cursorPos = this.input.selectionEnd;

    //选中文本长度
    const selectionLen = cursorPos - this.input.selectionStart;

    //需要删除文本的开始位置
    const deleteStart =
      selectionLen === 0 ? cursorPos - 1 : this.input.selectionStart;

    const newValue =
      value.substr(0, deleteStart) +
      event.target.innerText +
      value.substr(cursorPos, value.length - 1);

    //需要更新的光标位置
    const newCursorPos = deleteStart + event.target.innerText.length;
    this.setState({
      value: newValue,
      cursorPos: newCursorPos,
      characters: []
    });
  };

  //按键输入
  handlePressKey = (key, e) => {
    const { onChange, onClose } = this.props;
    const { value, letters, upperCase } = this.state;
    const cursorPos = this.input.selectionEnd;
    if (key.length > 1 && key.indexOf('icon') > -1) {
      //功能键
      const functionName = key.match(/-(\w+)/)[1];
      switch (functionName) {
        case 'keyboard':
          //收缩键盘
          e.stopPropagation();
          onClose && onClose();
          break;
        case 'delete':
          //回退键

          //选中文本长度
          const selectionLen = cursorPos - this.input.selectionStart;

          //需要删除文本的开始位置
          const deleteStart =
            selectionLen === 0 ? cursorPos - 1 : this.input.selectionStart;

          //需要更新的光标位置
          const newCursorPos =
            selectionLen === 0 ? cursorPos - 1 : cursorPos - selectionLen;

          if (cursorPos > 0) {
            const newValue =
              value.substr(0, deleteStart) +
              value.substr(cursorPos, value.length - 1);
            this.setState({
              value: newValue,
              cursorPos: newCursorPos,
              characters: []
            });
          }
          break;
        case 'uppercase':
          //大小写切换
          const updateLetters = letters.map(line => {
            line = line.map(letter => {
              if (letter.length === 1) {
                //字母切换大小写
                const fun = upperCase ? 'toLowerCase' : 'toUpperCase';
                letter = letter[fun]();
              } else if (letter.indexOf('uppercase') > -1) {
                //shift键状态切换
                const className = upperCase ? ' dusky' : '';
                letter = letter.split(' ')[0] + className;
              }
              return letter;
            });
            return line;
          });
          this.setState({
            letters: updateLetters,
            upperCase: !upperCase
          });
          break;
        case 'space':
          //空格键
          this.setState({
            value:
              value.substr(0, cursorPos) +
              ' ' +
              value.substr(cursorPos, value.length - 1),
            cursorPos: cursorPos + 1
          });
          break;
        default:
      }
    } else if (key.indexOf('确定') > -1) {
      //确定键
      e.stopPropagation();
      onChange && onChange(value);
      onClose && onClose();
    } else if (key.indexOf('重写') > -1) {
      //重写键
      console.log('重写');
    } else {
      //字符键
      this.setState({
        value:
          value.substr(0, cursorPos) +
          key +
          value.substr(cursorPos, value.length - 1),
        cursorPos: cursorPos + 1
      });
    }
  };

  handleChange = e => {
    const cursorPos = this.input.selectionEnd;
    this.setState({
      value: e.target.value,
      cursorPos: cursorPos
    });
  };

  handleKeyboardClick = () => {
    this.input.focus();
  };

  clearValue = () => {
    //清空输入
    this.setState({
      value: '',
      characters: []
    });
  };

  render() {
    const {
      visible,
      value,
      autoFocus,
      keyboardType,
      characters,
      letters
    } = this.state;
    return (
      <div
        className={classnames({ keyboard: true, show: visible })}
        onClick={this.handleKeyboardClick}
      >
        <header className="keyboard-output">
          <input
            type="text"
            value={value}
            autoFocus={autoFocus}
            ref={input => (this.input = input)}
            onChange={this.handleChange}
          />
          <i className="iconfont icon-Emptied" onClick={this.clearValue} />
        </header>
        <ul className="keyboard-nav">
          {['手写', '字母', '数字'].map((item, index) => {
            return (
              <li
                key={item}
                className={classnames({
                  'nav-item': true,
                  active: keyboardType === index
                })}
                onClick={this.handleSwitchKeyBoard.bind(this, index)}
              >
                {item}
              </li>
            );
          })}
        </ul>
        <section className="keyboard-content">
          <div
            className={classnames({
              'content-item': true,
              handwriting: true,
              active: keyboardType === 0
            })}
          >
            <div className="handwriting-enter">
              <p className="handwriting-options">
                {characters.length === 0 ? (
                  <span className="options-holder">备选字</span>
                ) : (
                  characters.map(char => {
                    return (
                      <span
                        key={char}
                        className="options-word"
                        onClick={this.handleSelectCharacters}
                      >
                        {char}
                      </span>
                    );
                  })
                )}
              </p>
              <canvas
                className="handwriting-drawboard"
                ref={drawboard => (this.drawboard = drawboard)}
              />
            </div>
            <ul className="handwriting-action">
              {['icon-keyboard', 'icon-delete', '确定'].map(key => {
                const iconName = key.indexOf('icon') > -1 && key;
                return (
                  <li
                    key={key}
                    className="action-item"
                    onClick={this.handlePressKey.bind(this, key)}
                  >
                    {iconName ? <i className={'iconfont ' + iconName} /> : key}
                  </li>
                );
              })}
            </ul>
          </div>
          <ul
            className={classnames({
              'content-item': true,
              letter: true,
              active: keyboardType === 1
            })}
          >
            {letters.map((line, index) => {
              return (
                <li key={index} className="letter-line">
                  {line.map((word, index) => {
                    const key = word.split(' ')[0];
                    const iconName = key.indexOf('icon') > -1 && key;
                    const secondaryClass = word.split(' ')[1];
                    return (
                      <span
                        key={key}
                        className={`letter-cell${secondaryClass
                          ? ' ' + secondaryClass
                          : ''}`}
                        onClick={this.handlePressKey.bind(this, key)}
                      >
                        {iconName ? (
                          <i className={'iconfont ' + iconName} />
                        ) : (
                          key
                        )}
                      </span>
                    );
                  })}
                </li>
              );
            })}
          </ul>
          <ul
            className={classnames({
              'content-item': true,
              digital: true,
              active: keyboardType === 2
            })}
          >
            {[
              ['- dusky', '1', '2', '3', 'icon-keyboard dusky'],
              ['+ dusky', '4', '5', '6', 'icon-delete dusky'],
              ['/ dusky', '7', '8', '9', 'icon-space dusky'],
              ['~ dusky', '。 dusky', '0', ', dusky', '确定 confirm']
            ].map((line, index) => {
              return (
                <li key={index} className="digital-line">
                  {line.map((word, index) => {
                    const key = word.split(' ')[0];
                    const iconName = key.indexOf('icon') > -1 && key;
                    const secondaryClass = word.split(' ')[1];
                    return (
                      <span
                        key={key}
                        className={`digital-cell${secondaryClass
                          ? ' ' + secondaryClass
                          : ''}`}
                        onClick={this.handlePressKey.bind(this, key)}
                      >
                        {iconName ? (
                          <i className={'iconfont ' + iconName} />
                        ) : (
                          key
                        )}
                      </span>
                    );
                  })}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }
}

export default Keyboard;
