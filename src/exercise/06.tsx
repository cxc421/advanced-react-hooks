// useDebugValue: useMedia
// http://localhost:3000/isolated/exercise/06.js

import React from 'react';

function useMedia(query: string, initialState = false) {
  const [state, setState] = React.useState(initialState);
  // 🐨 call React.useDebugValue here.
  // 💰 here's the formatted label I use: `\`${query}\` => ${state}`
  React.useDebugValue(
    {query, state},
    // if pass 2nd argument as a function, only execute when dev tool open!
    ({query, state}) => `\`${query}\` => ${state}`,
  );

  React.useEffect(() => {
    let mounted = true;
    const mql = window.matchMedia(query);
    function onChange() {
      if (!mounted) {
        return;
      }
      setState(Boolean(mql.matches));
    }

    mql.addEventListener('change', onChange);
    // mql.addListener(onChange);
    setState(mql.matches);

    return () => {
      mounted = false;
      mql.addEventListener('change', onChange);
      // mql.removeListener(onChange);
    };
  }, [query]);

  return state;
}

function Box() {
  const isBig = useMedia('(min-width: 1000px)');
  const isMedium = useMedia('(max-width: 999px) and (min-width: 700px)');
  const isSmall = useMedia('(max-width: 699px)');
  const color = isBig
    ? 'green'
    : isMedium
    ? 'yellow'
    : isSmall
    ? 'red'
    : undefined;

  return <div style={{width: 200, height: 200, backgroundColor: color}} />;
}

function App() {
  return <Box />;
}

export default App;
