// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import React from 'react';

type CountState = {count: number};
type CountAction = {type: 'INCREMENT'; step: number};

const countReducer = (state: CountState, action: CountAction): CountState => {
  if (action.type === 'INCREMENT') {
    return {
      ...state,
      count: state.count + action.step,
    };
  }
  return state;
};

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(
    countReducer,
    initialCount,
    initialCount => ({count: initialCount}),
  );
  const {count} = state;
  const increment = () => dispatch({type: 'INCREMENT', step});
  return <button onClick={increment}>{count}</button>;
}

function App() {
  return <Counter />;
}

export default App;
