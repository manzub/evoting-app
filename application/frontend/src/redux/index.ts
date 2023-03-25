import { applyMiddleware, combineReducers, createStore } from "@reduxjs/toolkit";
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from "redux-thunk";
import { userReducer } from "./reducers";

const reducer = combineReducers<AllReducers>({
  user: userReducer
})
const store = createStore(reducer, composeWithDevTools(
  applyMiddleware(thunk)
));
// const store = configureStore({ reducer, middleware: [thunk], preloadedState: {} })

export default store;