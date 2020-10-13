// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import React from 'react';

type CountState = {count: number};
type CountAction =
  | Partial<CountState>
  | ((curState: CountState) => Partial<CountState>);

const countReducer = (state: CountState, action: CountAction) => ({
  ...state,
  ...(typeof action === 'function' ? action(state) : action),
});

function Counter({initialCount = 0, step = 1}) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  });
  const {count} = state;
  const incrementByFunction = () =>
    setState(currentState => ({count: currentState.count + step}));
  const incrementByObject = () => setState({count: count + step});
  return (
    <>
      <button onClick={incrementByFunction}>{count}</button>
      <button onClick={incrementByObject}>{count}</button>
    </>
  );
}

function App() {
  return <Counter />;
}

export default App;
