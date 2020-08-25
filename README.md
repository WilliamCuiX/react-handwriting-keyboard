# react-handwriting-keyboard

A React Component to handwriting keyboard

# Installation

```
npm install react-handwriting-keyboard
```

# Usage

```jsx
import React from 'react';
import keyboard from 'react-handwriting-keyboard';

function InputComponent() {
  const showKeyboard = (e) => {
    const input = e.target;
    keyboard.show({
      target: e.target,
      onChange: (value) => {
        console.log('value: ', value);
        input.value = value;
      },
    });
  };
  return <input type="text" onClick={showKeyboard} />
}

React.render(
  <InputComponent />,
  mountNode
);
```

# <a href="https://williamcui31.github.io/react-handwriting-keyboard/">demo地址</a>