import axios from "axios";
import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import backendApi, { blockchainUrl } from "../utils/backendApi";

type Props = {
  ballots: IBallot[],
  user: IUser
}

const Ballot: React.FC<Props> = ({ ballots, user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentBallot = ballots.find(x => x._id === id);

  const [candidateViewing, setViewing] = React.useState<ICandidate>();
  const [vote, setVote] = React.useState('');
  const [error, setError] = React.useState('');

  // DONE: vote mutation
  const mutation = useMutation(function (postData: { ballotId: string, candidateId: string }) {
    if (!postData.ballotId || !postData.candidateId) throw new Error('Please select a candidate');
    return backendApi.voteCandidate(postData, (user.accessToken || ''));
  }, {
    onSuccess: async function (data, variables) {
      if (data.status === 1) {
        const addon = { ballotId: variables.ballotId, vote: variables.candidateId };
        await backendApi.createBallotInChain({ sender: user.address, amount: 0.01, addon });
        alert('you have successfully voted a candidate');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else throw new Error(data.message);
    }, onError: (error: Error) => setError(error.message)
  })

  async function processSubmit() {
    setError('');
    try {
      const postData = { address: user.address, ballotId: currentBallot?._id };
      const voteCheck = (await axios.post(`${blockchainUrl}/evoting/ballot/has-voted`, postData)).data;
      
      if(voteCheck.status === 2) {
        await backendApi.deleteBallot((currentBallot?._id || ''), (user.accessToken || ''))
        navigate('/');
      }

      if(voteCheck.hasVoted) {
        alert('You have already voted on this ballot');
        return true;
      }
      !voteCheck.hasVoted && mutation.mutate({ballotId: (currentBallot?._id || ''), candidateId: vote});
    } catch (error: any) {
      setError(Error(error).message);
    }
  }

  useEffect(() => {
    if (!currentBallot) {
      alert('Cannot find this ballot');
      navigate('/');
    }
    axios.get(`${blockchainUrl}/evoting/valid-ballot/${currentBallot?._id}`).then((response) => {
      if(!response.data.isValid) {
        backendApi.deleteBallot((currentBallot?._id || ''), (user.accessToken || '')).then(() => {
          navigate('/');
        });
      }
    })
  }, [currentBallot, navigate, user.accessToken]);

  return (<PageWrapper user={user}>
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Ballot Details</h5>
      </div>
      <div className="card-body">
        <h3>{currentBallot?.title}</h3>
        {(error || mutation.error) && <div className="alert alert-danger">
          {mutation.error?.message || error}
          <span onClick={() => setError('')} className="float-right">&times;</span>
        </div>}
        <p className="card-text">{currentBallot?.description}</p>
        <ul style={{ padding: 0, paddingLeft: '20px' }}>
          <li>Your choices are secret and cannot be accessed by the administrator.</li>
          <li>Select ONE choice.</li>
          <li>If you don't want to vote, select ABSTAIN.</li>
          <li>Choices are listed in random order.</li>
        </ul>
        <h4>Candidates</h4>
        <form>
          <div className="form-group">
            <ul className="list-group">
              {currentBallot?.candidates.map((candidate, idx) => <React.Fragment key={idx}>
                <li className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-start">
                      <img className="rounded-circle" src="/assets/img/avatars/avatar1.jpeg" alt="" style={{ height: '40px', width: '40px' }} />
                      <div style={{ marginLeft: '10px' }}>
                        <h5 style={{ marginBottom: '0px' }}>{candidate.fullname}</h5>
                        <button onClick={() => setViewing(candidate)} className="btn text-primary p-0" type='button' data-toggle="modal" data-target="#candidate-info">Information</button>
                      </div>
                    </div>
                    {/* TODO: string vote */}
                    <input
                      name="vote" type="radio"
                      onChange={({ target }) => setVote(target.value)}
                      value={candidate.id} />
                  </div>
                </li>
              </React.Fragment>)}
              <li className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-start">
                    <div style={{ marginLeft: '10px' }}>
                      <h5 style={{ marginBottom: '0px' }}>Abstain</h5>
                    </div>
                  </div>
                  {/* TODO: null vote */}
                  <input
                    name="vote" type="radio"
                    onChange={({ target }) => setVote(target.value)}
                    value='0' />
                </div>
              </li>
            </ul>
          </div>
          <div className="form-group">
            <button className="btn btn-warning btn-lg shadow-sm" onClick={processSubmit} type="button">Continue &gt;&gt;</button>
          </div>
        </form>
      </div>
    </div>
    {/* modal here */}
    <div className="modal fade" role="dialog" tabIndex={-1} id="candidate-info" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Candidate Information</h4>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="d-flex align-items-start" style={{ width: '100%' }}><img className="rounded"
                src="/assets/img/dogs/image3.jpeg" alt="" style={{ height: '100px', width: '100px' }} />
                <div style={{ marginLeft: '10px', flex: 2 }}>
                  <h4>{candidateViewing?.fullname}</h4>
                  <h5>Votes:</h5>
                  <h1>{candidateViewing?.votes}</h1>
                  <div role="tablist" id="accordion-1" style={{ width: '100%' }}>
                    <div className="card">
                      <div className="card-header" role="tab">
                        <h5 className="mb-0"><a data-toggle="collapse" aria-expanded="true"
                          aria-controls="accordion-1 .item-1" href="#accordion-1 .item-1">Candidate Information</a>
                        </h5>
                      </div>
                      <div className="collapse show item-1" role="tabpanel" data-parent="#accordion-1">
                        <div className="card-body">
                          <p className="card-text">{candidateViewing?.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header" role="tab">
                        <h5 className="mb-0"><a data-toggle="collapse" aria-expanded="false"
                          aria-controls="accordion-1 .item-2" href="#accordion-1 .item-2">Party Information</a></h5>
                      </div>
                      <div className="collapse item-2" role="tabpanel" data-parent="#accordion-1">
                        <div className="card-body">
                          <p className="card-text">{candidateViewing?.party_info}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer"><button className="btn btn-light" type="button" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>)
}

export default Ballot;