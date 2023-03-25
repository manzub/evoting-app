import axios from "axios";

export const backendUrl = "http://localhost:5555";
const authRoute = `${backendUrl}/auth`;


const authActions = {
  async signin(email: string, password: string){
    const response = await axios.post(`${authRoute}/signin`, { email, password })
    return response.data;
  },
  async signinToken(token: string) {
    const response = await axios.post(`${authRoute}/user-token`, { token })
    return response.data;
  },
  async signup(postData: { email: string, password: string, firstname: string, lastname: string }) {
    const response = await axios.post(`${authRoute}/signup`, postData)
    return response.data;
  }
}

const backendApi = {
  // auth routes
  ...authActions,
  async getBallots() {
    const response = await axios.get(`${backendUrl}/ballots`)
    return response.data;
  },
  async createBallot(postData: IBallot, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/create`, postData, { headers: {  'x-access-token': token } })
    return response.data;
  },
  async deleteBallot(ballotId: string, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/delete`, ballotId, { headers: {  'x-access-token': token } })
    return response.data;
  },
  async completeBallot(ballotId: string, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/complete`, ballotId, { headers: {  'x-access-token': token } })
    return response.data;
  },
  async voteCandidate(postData: { ballotId: string, candidateId: string }, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/vote`, postData, { headers: {  'x-access-token': token } })
    return response.data;
  },
  formatTime(timestampString: string) {
    let formatted = timestampString.split('-').join('/');
    let timeString = formatted.split('T')[1].split('.')[0];
    return formatted.split('T')[0] + ' ' + timeString;
  }
}

export default backendApi;