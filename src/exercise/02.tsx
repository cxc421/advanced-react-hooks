// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js
import React, {FC} from 'react';
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon';


type AsyncState =
  | {status: 'idle';}
  | {status: 'pending'; }
  | {status: 'resolved'; data: any; }
  | {status: 'rejected'; error: Error};

type AsyncAction =
  | {type: 'pending'}
  | {type: 'resolved'; data: any}
  | {type: 'rejected'; error: Error};

function useAsyncReducer(
  state: AsyncState,
  action: AsyncAction,
): AsyncState {
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

function useAsync(asyncCallback: () => Promise<any> | undefined, initialState: AsyncState, deps: any[]) {
  const [state, dispatch] = React.useReducer(useAsyncReducer, initialState);

  React.useEffect(() => {
    const promise = asyncCallback()
    if (!promise) {
      return
    }
    dispatch({type: 'pending'});
    promise
      .then(data => dispatch({ type: 'resolved', data }), error => dispatch({type: 'rejected', error}));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return state;
}

type PokemonInfoProps = {
  pokemonName: string;
};

const PokemonInfo: FC<PokemonInfoProps> = ({pokemonName}) => {
  const state = useAsync(
    () => {
      if (!pokemonName) {
        return
      }
      return fetchPokemon(pokemonName)
    },
    {status: pokemonName ? 'pending' : 'idle'},
    [pokemonName],
  )

  if (state.status === 'idle' || !pokemonName) {
    return <>Submit a pokemon</>;
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (state.status === 'rejected') {
    throw state.error;
  } else if (state.status === 'resolved') {
    return <PokemonDataView pokemon={state.data} />;
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
