// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js
import React, {FC} from 'react';
import {Pokemon} from '../pokemon';
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon';

function useSafeDispatch<T>(dispatch: React.Dispatch<T>): React.Dispatch<T> {
  const componentMountedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  return React.useCallback(
    action => {
      if (componentMountedRef.current) {
        dispatch(action);
      }
    },
    [dispatch],
  );
}

type AsyncState =
  | {status: 'idle'}
  | {status: 'pending'}
  | {status: 'resolved'; data: unknown}
  | {status: 'rejected'; error: Error};

type AsyncAction =
  | {type: 'pending'}
  | {type: 'resolved'; data: unknown}
  | {type: 'rejected'; error: Error};

function useAsyncReducer(state: AsyncState, action: AsyncAction): AsyncState {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending'};
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data};
    }
    case 'rejected': {
      return {status: 'rejected', error: action.error};
    }
    default: {
      return state;
    }
  }
}

function useAsync(initialState: AsyncState) {
  const [state, unsafeDispatch] = React.useReducer(
    useAsyncReducer,
    initialState,
  );
  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = React.useCallback(
    (promise: Promise<unknown>) => {
      dispatch({type: 'pending'});
      promise.then(
        data => dispatch({type: 'resolved', data}),
        error => dispatch({type: 'rejected', error}),
      );
    },
    [dispatch],
  );

  return {...state, run};
}

type PokemonInfoProps = {
  pokemonName: string;
};

const PokemonInfo: FC<PokemonInfoProps> = ({pokemonName}) => {
  const state = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  });
  const {run} = state;

  React.useEffect(() => {
    if (!pokemonName) return;
    run(fetchPokemon(pokemonName));
  }, [pokemonName, run]);

  if (state.status === 'idle' || !pokemonName) {
    return <>Submit a pokemon</>;
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (state.status === 'rejected') {
    throw state.error;
  } else if (state.status === 'resolved') {
    return <PokemonDataView pokemon={state.data as Pokemon} />;
  }

  throw new Error('This should be impossible');
};

function App() {
  const [pokemonName, setPokemonName] = React.useState('');

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName);
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  );
}

export default App;
