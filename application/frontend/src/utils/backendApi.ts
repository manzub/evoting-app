import axios from "axios";

export const evotingAccount = "f0ac8c079e991f7a7f0c54be8fdaf9584e6a438c6ba0d7603af820e98c7de5da";
export const blockchainUrl = 'http://localhost:3001';
export const backendUrl = "http://localhost:5555";
const authRoute = `${backendUrl}/auth`;


const authActions = {
  async signin(email: string, password: string) {
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

const ballotFunctions = {
  async getBallots() {
    const response = await axios.get(`${backendUrl}/ballots`)
    return response.data;
  },
  async createBallot(postData: IBallot, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/create`, postData, { headers: { 'x-access-token': token } })
    return response.data;
  },
  async deleteBallot(ballotId: string, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/delete`, {ballotId}, { headers: { 'x-access-token': token } })
    return response.data;
  },
  async completeBallot(ballotId: string, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/complete`, {ballotId}, { headers: { 'x-access-token': token } })
    return response.data;
  },
  async voteCandidate(postData: { ballotId: string, candidateId: string }, token: string) {
    const response = await axios.post(`${backendUrl}/admin/ballots/vote`, postData, { headers: { 'x-access-token': token } })
    return response.data;
  }
}

const blockchainFunctions = {
  async checkAccountExists(walletAdress: string) {
    const response = await axios.get(`${blockchainUrl}/accounts/${walletAdress}`)
    return response.data;
  },
  async createAccount() {
    const response = await axios.post(`${blockchainUrl}/accounts/new`)
    return response.data;
  },
  async createBallotInChain(postData: { sender: string, amount: number, addon: any }) {
    let recipient = evotingAccount;
    const response = await axios.post(`${blockchainUrl}/transfer`, {...postData, recipient})
    return response.data;
  }
}

const backendApi = {
  // auth routes
  ...authActions,
  ...ballotFunctions,
  ...blockchainFunctions,
  formatTime(timestampString: string) {
    let formatted = timestampString.split('-').join('/');
    let timeString = formatted.split('T')[1].split('.')[0];
    return formatted.split('T')[0] + ' ' + timeString;
  }
}

export default backendApi;