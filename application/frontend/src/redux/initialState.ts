export const initialState: UserState = {
  user: {
    name: '', email: '', firstname: '', lastname: '', accessToken: null, isAuthenticated: false, role: 2
  },
}

export const emptyState = {
  user: {
    name: null,
    isAuthenticated: false
  },
}


export default initialState;