// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import React, {FC, useContext} from 'react';

type CountContextType = [number, React.Dispatch<React.SetStateAction<number>>];
const CountContext = React.createContext<CountContextType | null>(null);

const CountProvider: FC = props => {
  const value = React.useState(0);
  return (
    <CountContext.Provider value={value} {...props}></CountContext.Provider>
  );
};

function useCount() {
  const context = useContext(CountContext);
  if (!context)
    throw new Error(`useCount must be used within the CountProvider`);
  return context;
}

function CountDisplay() {
  const [count] = useCount();
  return <div>{`The current count is ${count}`}</div>;
}

function Counter() {
  const [, setCount] = useCount();
  const increment = () => setCount(c => c + 1);
  return <button onClick={increment}>Increment count</button>;
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  );
}

export default App;
