import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from './reducers';
import logger from 'redux-logger';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHistory({});
// Build the middleware for intercepting and dispatching navigation actions
const historyMiddleware = routerMiddleware(history);
const middleware = applyMiddleware(logger, historyMiddleware);
const store = createStore(reducers, composeWithDevTools(middleware));

export { history as history };
export default store;
