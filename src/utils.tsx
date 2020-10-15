import React from 'react';

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

function useAsync(initialState?: AsyncState) {
  const [state, unsafeDispatch] = React.useReducer(useAsyncReducer, {
    status: 'idle',
    ...(initialState ? initialState : {}),
  });
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

  const setData = React.useCallback(
    data => dispatch({type: 'resolved', data}),
    [dispatch],
  );
  const setError = React.useCallback(
    error => dispatch({type: 'rejected', error}),
    [dispatch],
  );

  return {...state, run, setData, setError};
}

export {useAsync};
