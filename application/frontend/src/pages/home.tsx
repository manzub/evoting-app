import React from "react";
import Countdown from "react-countdown";
import { useMutation } from "react-query";
import { NavLink } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import backendApi from "../utils/backendApi";

type Props = {
  ballots: IBallot[],
  user: IUser
}

const Home: React.FC<Props> = ({ ballots, user }) => {
  const [error, setError] = React.useState('');

  const mutation = useMutation(function (ballotId: string) {
    return backendApi.deleteBallot(ballotId, (user.accessToken || ''));
  }, {
    onSuccess: function (data) {
      if (data.status === 1) {
        alert(data.message);
      } else throw new Error(data.message);
    }, onError: (error: Error) => setError(error.message)
  })

  function deleteBallot(ballotId: string) {
    setError('');
    if (window.confirm('Are you sure you want to delete')) {
      mutation.mutate(ballotId);
    }
  }

  return (<PageWrapper user={user}>
    <h3 className="text-dark mb-1">Ballots</h3>
    {(error || mutation.error) && <div className="alert alert-danger">
      {mutation.error?.message || error}
      <span onClick={() => setError('')} className="float-right">&times;</span>
    </div>}
    <div className="row">
      {ballots.length > 0 && ballots.map(function (ballot, idx) {
        // todo use created at to calculate duration;
        let disabledBallot = false;
        let created_at = new Date(backendApi.formatTime(ballot.created_at));
        created_at.setDate(created_at.getDate() + ballot.duration);
        let now = new Date();
        const diffTime = (created_at.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          disabledBallot = true;
          if(ballot.status === 'ongoing') {
            console.log('complete ballot');
            backendApi.completeBallot(ballot._id, (user?.accessToken || ''));
          }
        }

        let totalVotes = ballot.candidates.map(x => x.votes).reduce((prev, next) => prev + next) + 1;
        return (<React.Fragment key={idx}>
          <div className="col-lg-6 col-md-12 mb-3">
            <div className="card">
              <div className="card-body" style={{ padding: '10px' }}>
                <h4 className="card-title mb-1">{ballot.title} <span className="badge badge-success text-capitalize">{ballot.status}</span></h4>
                <div className="row mb-3">
                  <div className="col">
                    <div className="row align-items-center no-gutters">
                      <div className="col mr-2">
                        <div className="text-uppercase text-primary font-weight-bold text-xs mb-1 ballot-meta"><span>votes (all contst.)</span></div>
                        <div className="text-dark font-weight-bold h5 mb-0 ballot-meta"><span>{totalVotes}</span></div>
                      </div>
                      <div className="col-auto"><i className="fas fa-users fa-2x text-gray-300"></i></div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="row align-items-center no-gutters">
                      <div className="col mr-2">
                        <div className="text-uppercase text-primary font-weight-bold text-xs mb-1"><span>time left:</span></div>
                        <div className="text-dark font-weight-bold h5 mb-0">
                          {/* <span></span> */}
                          <Countdown date={created_at} />
                        </div>
                      </div>
                      <div className="col-auto"><i className="far fa-clock fa-2x text-gray-300"></i></div>
                    </div>
                  </div>
                </div>
                <h4>Top Contenders</h4>
                <div className="mb-4">
                  {ballot.candidates.map((candidate, idx) => {
                    let progress = Math.floor((candidate.votes / totalVotes) * 100);
                    return (<div key={idx} className="progress mb-2" style={{ height: '30px' }}>
                      <div className="progress-bar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>)
                  })}
                </div>
                {disabledBallot ? <button onClick={() => window.alert('Ballot has been completed, no more votings allowed!')} className="btn btn-warning btn-icon-split mr-2">
                  <span className="text-white-50 icon"><i className="fas fa-arrow-right"></i></span>
                  <span className="text-white text">View</span>
                </button> : <NavLink className="btn btn-success btn-icon-split mr-2" role="button" to={`/ballot/${ballot._id}`}>
                  <span className="text-white-50 icon"><i className="fas fa-arrow-right"></i></span>
                  <span className="text-white text">View</span>
                </NavLink>}
                {user.role === 1 && <button onClick={() => deleteBallot(ballot._id)} className="btn btn-danger btn-icon-split">
                  <span className="text-white-50 icon"><i className="fas fa-trash"></i></span>
                  <span className="text-white text">Delete</span>
                </button>}
              </div>
            </div>
          </div>
        </React.Fragment>)
      })}
      {ballots.length === 0 && <p>No ballots yet</p>}
    </div>
  </PageWrapper>)
}

export default Home;