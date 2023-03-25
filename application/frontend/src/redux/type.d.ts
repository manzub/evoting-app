interface IUser {
  name: string,
  email: string,
  firstname: string,
  lastname: string,
  role: number
  accessToken: string | null,
  isAuthenticated: boolean,
}

interface IBallot {
  _id: string,
  created_at: string,
  title: string,
  description: string,
  candidates: ICandidate[],
  status: string
  duration: number
}

interface ICandidate {
  id?: string,
  fullname: string,
  description: string,
  party_info: any,
  votes: number
}

type UserState = {
  user: IUser
}

type UserAction = {
  type: string
  payload: IUser
}

type AllReducers = {
  user: IUser
}

type DispatchType = (args: UserAction) => UserAction