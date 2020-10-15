// useContext: Caching response data in context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.js

import React, {FC} from 'react';
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
  Pokemon,
} from '../pokemon';
import {useAsync} from '../utils';

type PokemonCacheState = {[pokemonName: string]: Pokemon};
type PokemonCacheAction = {
  type: 'ADD_POKEMON';
  pokemonName: string;
  pokemonData: Pokemon;
};

function pokemonCacheReducer(
  state: PokemonCacheState,
  action: PokemonCacheAction,
) {
  switch (action.type) {
    case 'ADD_POKEMON': {
      return {...state, [action.pokemonName]: action.pokemonData};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

type PokemonCacheContextType = [
  PokemonCacheState,
  React.Dispatch<PokemonCacheAction>,
];
const PokemonCacheContext = React.createContext<PokemonCacheContextType | null>(
  null,
);

const PokemonCahceProvider: FC = props => {
  const value = React.useReducer(pokemonCacheReducer, {});
  return <PokemonCacheContext.Provider {...props} value={value} />;
};

function usePokemonCache() {
  const context = React.useContext(PokemonCacheContext);
  if (!context)
    throw new Error(`usePokemonCache must used wihin the PokemonCacheProvide`);
  return context;
}

type PokemonInfoProps = {
  pokemonName: string;
};

const PokemonInfo: FC<PokemonInfoProps> = ({pokemonName}) => {
  const [cache, dispatch] = usePokemonCache();

  const state = useAsync();
  const {run, setData} = state;

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    } else if (cache[pokemonName]) {
      setData(cache[pokemonName]);
    } else {
      run(
        fetchPokemon(pokemonName).then(pokemonData => {
          dispatch({type: 'ADD_POKEMON', pokemonName, pokemonData});
          return pokemonData;
        }),
      );
    }
  }, [cache, pokemonName, run, setData, dispatch]);

  if (state.status === 'idle') {
    return <>'Submit a pokemon'</>;
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />;
  } else if (state.status === 'rejected') {
    throw state.error;
  } else if (state.status === 'resolved') {
    return <PokemonDataView pokemon={state.data as Pokemon} />;
  }
  throw new Error(`Unknow state`);
};

type PreviousPokemonProps = {
  onSelect: (pokemonName: string) => void;
};

const PreviousPokemon: FC<PreviousPokemonProps> = ({onSelect}) => {
  const [cache] = usePokemonCache();
  return (
    <div>
      Previous Pokemon
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {Object.keys(cache).map(pokemonName => (
          <li key={pokemonName} style={{margin: '4px auto'}}>
            <button
              style={{width: '100%'}}
              onClick={() => onSelect(pokemonName)}
            >
              {pokemonName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

type PokemonSectionProps = {
  onSelect: (pokemonName: string) => void;
  pokemonName: string;
};

const PokemonSection: FC<PokemonSectionProps> = ({onSelect, pokemonName}) => {
  return (
    <PokemonCahceProvider>
      <div style={{display: 'flex'}}>
        <PreviousPokemon onSelect={onSelect} />
        <div className="pokemon-info" style={{marginLeft: 10}}>
          <PokemonErrorBoundary
            onReset={() => onSelect('')}
            resetKeys={[pokemonName]}
          >
            <PokemonInfo pokemonName={pokemonName} />
          </PokemonErrorBoundary>
        </div>
      </div>
    </PokemonCahceProvider>
  );
};

function App() {
  const [pokemonName, setPokemonName] = React.useState('');

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName);
  }

  function handleSelect(newPokemonName: string) {
    setPokemonName(newPokemonName);
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
    </div>
  );
}

export default App;
