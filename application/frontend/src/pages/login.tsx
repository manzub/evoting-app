import React from "react";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux"
import { NavLink } from "react-router-dom";
import * as actionTypes from "../redux/actionTypes";
import backendApi from "../utils/backendApi";


const Login = () => {
  const dispatch = useDispatch();

  const [form, updateForm] = React.useState({ email: '', password: '' });
  const [error, setError] = React.useState('');

  const mutation = useMutation(function(postData: { email: string, password: string }) {
    if(!(postData.email && postData.password)) throw new Error('Fill in all fields');
    return backendApi.signin(postData.email, postData.password);
  }, { onSuccess: function(data) {
    if(data.status === 1) {
      const action: UserAction = {
        type: actionTypes.SIGN_IN,
        payload: {...data.user, isAuthenticated: true}
      }
      dispatch(action)
    } else throw new Error(data.message);
  }, onError: (error: any) => setError(error) })


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
                    {(mutation.error || error) && <strong>Uh-oh <span>{mutation.error!.message}</span></strong>}
                  </div>
                  <form onSubmit={processSubmit} className="user">
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
                    <div className="form-group">
                      <input
                        className="form-control form-control-user"
                        type="password"
                        value={form.password}
                        disabled={mutation.isLoading}
                        onChange={({ target }) => updateForm({ ...form, password: target.value })}
                        id="exampleInputPassword"
                        placeholder="Password" />
                    </div>
                    <div className="form-group">
                      <div className="custom-control custom-checkbox small">
                        <div className="form-check"><input className="form-check-input custom-control-input" type="checkbox" id="formCheck-1" /><label className="form-check-label custom-control-label" htmlFor="formCheck-1">Remember Me</label></div>
                      </div>
                    </div>
                    <button disabled={mutation.isLoading} className="btn btn-primary btn-block text-white btn-user" type="submit">Login</button>
                    <hr />
                  </form>
                  <div className="text-center"><a className="small" href="forgot-password.html">Forgot Password?</a></div>
                  <div className="text-center"><NavLink className="small" to={"/register"}>Create an Account!</NavLink></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>)
}

export default Login;