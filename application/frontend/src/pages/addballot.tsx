import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper"
import backendApi from "../utils/backendApi";

type Props = {
  user: IUser
}

const AddBallot: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  const [form, updateForm] = React.useState<IBallot>({ _id: '', title: '', description: '', duration: 1, candidates: [], status: 'ongoing', created_at: '' })
  const [candidateForm, setCandidate] = React.useState({ fullname: '', description: '', party_info: '', votes: 0 });

  const [error, setError] = React.useState('');

  const mutation = useMutation(function (postData: IBallot) {
    if (!(postData.description && postData.title)) throw new Error('Fill in all fields');
    if (postData.candidates.length < 2) throw new Error('Please select atleast 2 candidates');
    return backendApi.createBallot(postData, (user.accessToken || ''));
  }, {
    onSuccess: async function (data) {
      if (data.status === 1) {
        let created_at = new Date().toLocaleString();
        const addon = { ballotId: data.ballotId, created_at };
        await backendApi.createBallotInChain({sender:user.address, amount: 0.01, addon});
        alert(`${data.message} and added to blockchain`);
        navigate('/');
      } else throw new Error(data.message);
    }, onError: (error: Error) => setError(error.message)
  })

  async function processSubmit(e: React.FormEvent<HTMLFormElement>) {
    setError('');
    e.preventDefault();
    // TODO: add ballot id as a transaction to the blockchain under this user wallet
    try {
      const accountInfo = await backendApi.checkAccountExists(user.address);
      if (accountInfo.status === 1) {
        let predictedGas = 0.01;
        if (accountInfo.data.balance > (predictedGas * 0.01)) {
          mutation.mutate(form);
        } else throw new Error('Insufficient balance, please acquire more coins');
      } else throw new Error('Cannot get wallet info');
    } catch (error: any) {
      setError(error?.message)
    }
  }

  function addCandidate() {
    updateForm({ ...form, candidates: [...form.candidates, candidateForm] });
    setCandidate({ fullname: '', description: '', party_info: '', votes: 0 });
    alert('Candidate Added');
  }

  useEffect(() => {
    if (user && user.role === 2) {
      alert('Only Admins can access this.')
      navigate('/');
    }
  }, [user, navigate])

  return (<PageWrapper user={user}>
    <h3 className="text-dark mb-1">Add Ballot</h3>
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card body p-4">
            <div className="row">
              <div className="col-md-6">
                <form onSubmit={processSubmit}>
                  <h2>Ballot Info</h2>
                  {(mutation.error || error) && <p className="text-danger">{error || mutation.error?.message}</p>}
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      value={form.title}
                      onChange={({ target }) => updateForm({ ...form, title: target.value })}
                      placeholder="Ballot Title" />
                  </div>
                  <div className="form-group">
                    <textarea
                      rows={10}
                      placeholder="Ballot description here"
                      value={form.description}
                      onChange={({ target }) => updateForm({ ...form, description: target.value })}
                      className="form-control" />
                  </div>
                  <div className="form-group">
                    <h3>Candidates <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal"><i className="fas fa-plus"></i> Add</button></h3>
                    <div className="row">
                      {form.candidates.length > 0 && form.candidates.map((candidate, idx) => <div key={idx} className="col-md-12 border rounded p-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-block">
                            <h5>{candidate.fullname}</h5>
                            <span className="text-primary">information...</span>
                          </div>
                          <button onClick={() => updateForm({ ...form, candidates: form.candidates.filter(x => x.fullname !== candidate.fullname) })} className="btn btn-danger"><i className="fas fa-times"></i></button>
                        </div>
                      </div>)}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="">Ballot Duration(hrs)</label>
                    <input
                      className="form-control mb-2"
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={({ target }) => updateForm({ ...form, duration: parseInt(target.value) })} />
                    <button className="btn btn-lg btn-primary btn-block text-white btn-user" type="submit">Create Ballot</button>
                  </div>
                </form>
              </div>
              <div className="col-md-6">
                <h2>Preview</h2>
                <div className="card">
                  <div className="card-body" style={{ padding: '10px' }}>
                    <h4 className="card-title mb-1">{form.title || 'Ballot Title'}<span className="badge badge-success">Ongoing</span></h4>
                    <div className="row mb-3">
                      <div className="col">
                        <div className="row align-items-center no-gutters">
                          <div className="col mr-2">
                            <div className="text-uppercase text-primary font-weight-bold text-xs mb-1 ballot-meta"><span>votes (all contst.)</span></div>
                            <div className="text-dark font-weight-bold h5 mb-0 ballot-meta"><span>0,000,000</span></div>
                          </div>
                          <div className="col-auto"><i className="fas fa-users fa-2x text-gray-300"></i></div>
                        </div>
                      </div>
                      <div className="col">
                        <div className="row align-items-center no-gutters">
                          <div className="col mr-2">
                            <div className="text-uppercase text-primary font-weight-bold text-xs mb-1"><span>time left:</span></div>
                            <div className="text-dark font-weight-bold h5 mb-0"><span>{form.duration * 24}:00hrs</span></div>
                          </div>
                          <div className="col-auto"><i className="far fa-clock fa-2x text-gray-300"></i></div>
                        </div>
                      </div>
                    </div>
                    <h4>Top Contenders</h4>
                    <div className="mb-4">
                      {form.candidates.map((item, idx) => <div key={idx} className="progress mb-2" style={{ height: '30px' }}>
                        <div className="progress-bar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} style={{ width: '0%' }}>0%</div>
                      </div>)}
                    </div><span className="btn btn-success btn-icon-split" role="button"><span className="text-white-50 icon"><i className="fas fa-arrow-right"></i></span><span className="text-white text">View</span></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={addCandidate}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  value={candidateForm.fullname}
                  onChange={({ target }) => setCandidate({ ...candidateForm, fullname: target.value })}
                  placeholder="Candidate Name" />
              </div>
              <div className="form-group">
                <textarea
                  rows={10}
                  className="form-control"
                  value={candidateForm.description}
                  onChange={({ target }) => setCandidate({ ...candidateForm, description: target.value })}
                  placeholder="Other Info" />
              </div>
              <div className="form-group">
                <textarea
                  rows={10}
                  className="form-control"
                  value={candidateForm.party_info}
                  onChange={({ target }) => setCandidate({ ...candidateForm, party_info: target.value })}
                  placeholder="Other Info" />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            <button onClick={addCandidate} type="button" className="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>)
}

export default AddBallot;