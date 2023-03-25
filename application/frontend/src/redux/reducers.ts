import * as actionTypes from "./actionTypes"
import initialState from "./initialState";

export const userReducer = (
  state: IUser = initialState.user,
  action: UserAction
): IUser => {
  switch (action.type) {
    case actionTypes.SIGN_IN:
      return { ...state, ...action.payload  }
    default:
      break;
  }
  return state
}