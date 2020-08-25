---
title: react-handwriting-keyboard
---

# 这是一个支持手写键盘的react组件
```jsx
import React from 'react';
import keyboard from 'react-handwriting-keyboard';
export default () => {
  const showKeyboard = (e) => {
    const input = e.target;
    keyboard.show({
      target: e.target,
      onChange: (value) => {
        input.value = value;
      },
    });
  };

  return <input type="text" onClick={showKeyboard} />
};
```