import React from "react";
import { useMutation } from "react-query";
import { NavLink, useNavigate } from "react-router-dom";
import backendApi from "../utils/backendApi";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, updateForm] = React.useState({ firstname: '', lastname: '', email: '', password: '', rppassword: '' });
  const [error, setError] = React.useState<Error>();

  const mutation = useMutation(function (postData: { email: string, password: string, firstname: string, lastname: string }) {
    if (form.rppassword !== form.password) throw new Error('Passwords Don\'t Match');
    if (!(postData.email && postData.password && postData.firstname)) throw new Error('Fill in all fields');
    return backendApi.signup(postData);
  }, {
    onSuccess: function (data) {
      if (data.status === 1) {
        // TODO: create blockchain data after login
        alert(data.message);
        navigate('/login')
      } else throw new Error(data.message);
      
    }, onError: (error: any) => setError(error)
  })


  function processSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (<div className="container">
    <div className="row justify-content-center">
      <div className="col-md-9 col-lg-12 col-xl-10">
        <div className="card shadow-lg o-hidden border-0 my-5">
          <div className="card-body p-0">
            <div className="row">
              <div className="col-lg-6 d-none d-lg-flex">
                <div className="flex-grow-1 bg-login-image" style={{ backgroundImage: "url('assets/img/dogs/image3.jpeg')" }}></div>
              </div>
              <div className="col-lg-6">
                <div className="p-5">
                  <div className="text-center mb-4">
                    <h4 className="text-dark">Welcome Back!</h4>
                    {(mutation.error || error) && <strong className="text-danger">Uh-oh <span>{error?.message || mutation.error!.message}</span></strong>}
                  </div>
                  <form onSubmit={processSubmit} className="user">
                    <div className="form-group row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <input
                          className="form-control form-control-user"
                          type="text"
                          value={form.firstname}
                          onChange={({ target }) => updateForm({ ...form, firstname: target.value })}
                          id="exampleInputFName"
                          aria-describedby="emailHelp"
                          placeholder="First Name..." />
                      </div>
                      <div className="col-sm-6">
                        <input
                          className="form-control form-control-user"
                          type="text"
                          value={form.lastname}
                          onChange={({ target }) => updateForm({ ...form, lastname: target.value })}
                          id="exampleInputLName"
                          aria-describedby="emailHelp"
                          placeholder="Last Name..." />
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control form-control-user"
                        type="email"
                        value={form.email}
                        onChange={({ target }) => updateForm({ ...form, email: target.value })}
                        id="exampleInputEmail"
                        aria-describedby="emailHelp"
                        placeholder="Enter Email Address..." />
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <input
                          className="form-control form-control-user"
                          type="password"
                          value={form.password}
                          disabled={mutation.isLoading}
                          onChange={({ target }) => updateForm({ ...form, password: target.value })}
                          id="exampleInputPassword"
                          placeholder="Password" />
                      </div>
                      <div className="col-sm-6">
                        <input
                          className="form-control form-control-user"
                          type="password"
                          value={form.rppassword}
                          disabled={mutation.isLoading}
                          onChange={({ target }) => updateForm({ ...form, rppassword: target.value })}
                          id="exampleInputRPPassword"
                          placeholder="Repeat Password" />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="custom-control custom-checkbox small">
                        <div className="form-check"><input className="form-check-input custom-control-input" type="checkbox" id="formCheck-1" /><label className="form-check-label custom-control-label" htmlFor="formCheck-1">Remember Me</label></div>
                      </div>
                    </div>
                    <button disabled={mutation.isLoading} className="btn btn-primary btn-block text-white btn-user" type="submit">Create Account</button>
                    <hr />
                  </form>
                  <div className="text-center"><NavLink className="small" to="login">Already have an account? Login!</NavLink></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)
}

export default Register;