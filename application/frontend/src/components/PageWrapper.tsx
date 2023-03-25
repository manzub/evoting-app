import React, { ReactNode } from "react";
import { useDispatch } from "react-redux";
import * as actionTypes from '../redux/actionTypes';
import { NavLink, useNavigate } from "react-router-dom";
import initialState from "../redux/initialState";

interface PageWrapperProps {
  user: IUser,
  children: ReactNode
}

export default function PageWrapper({ user, children }: PageWrapperProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  function signOutUser() {
    const action: UserAction = {
      type: actionTypes.SIGN_IN,
      payload: initialState.user
    }
    dispatch(action)
    navigate('/login');
  }

  return (<div className="page-wrapper" id="wrapper">
    <nav className="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0">
      <div className="container-fluid d-flex flex-column p-0">
        <a className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0" href="#ss">
          <div className="sidebar-brand-icon rotate-n-15"><i className="fas fa-laugh-wink"></i></div>
          <div className="sidebar-brand-text mx-3"><span>ElectionBuddy</span></div>
        </a>
        <hr className="sidebar-divider my-0" />
        <ul className="nav navbar-nav text-light" id="accordionSidebar">
          <li className="nav-item" role="presentation"><NavLink className="nav-link" to="/">
            <i className="fas fa-tachometer-alt"></i><span>Ballots</span></NavLink>
          </li>
          { user.role === 1 && <li className="nav-item" role="presentation"><NavLink className="nav-link" to="/addballot">
            <i className="fas fa-user"></i><span>Add Ballot</span></NavLink>
          </li>}
          <li className="nav-item" role="presentation"><span onClick={signOutUser} className="nav-link">
            <i className="fas fa-sign-out-alt"></i><span>Logout</span></span>
          </li>
        </ul>
        <div className="text-center d-none d-md-inline"><button className="btn rounded-circle border-0" id="sidebarToggle"
          type="button"></button></div>
      </div>
    </nav>
    <div className="d-flex flex-column" id="content-wrapper">
      <div id="content">
        <nav className="navbar navbar-light navbar-expand bg-white shadow mb-4 topbar static-top">
          <div className="container-fluid"><button className="btn btn-link d-md-none rounded-circle mr-3" id="sidebarToggleTop"
            type="button"><i className="fas fa-bars"></i></button>
            <form className="form-inline d-none d-sm-inline-block mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
              <div className="input-group"><input className="bg-light form-control border-0 small" type="text"
                placeholder="Search for ..." />
                <div className="input-group-append"><button className="btn btn-primary py-0" type="button"><i
                  className="fas fa-search"></i></button></div>
              </div>
            </form>
            <ul className="nav navbar-nav flex-nowrap ml-auto">
              <li className="nav-item dropdown d-sm-none no-arrow"><a className="dropdown-toggle nav-link"
                data-toggle="dropdown" aria-expanded="false" href="#s"><i className="fas fa-search"></i></a>
                <div className="dropdown-menu dropdown-menu-right p-3 animated--grow-in" role="menu"
                  aria-labelledby="searchDropdown">
                  <form className="form-inline mr-auto navbar-search w-100">
                    <div className="input-group"><input className="bg-light form-control border-0 small" type="text"
                      placeholder="Search for ..." />
                      <div className="input-group-append"><button className="btn btn-primary py-0" type="button"><i
                        className="fas fa-search"></i></button></div>
                    </div>
                  </form>
                </div>
              </li>
              <li className="nav-item dropdown no-arrow mx-1" role="presentation">
                <div className="nav-item dropdown no-arrow">
                  <span className="nav-link">
                    <span className="badge badge-danger badge-counter">0</span>
                    <i className="fas fa-bell fa-fw"></i>
                  </span>
                </div>
              </li>
              <div className="d-none d-sm-block topbar-divider"></div>
              <li className="nav-item dropdown no-arrow" role="presentation">
                <div className="nav-item dropdown no-arrow">
                  <a className="dropdown-toggle nav-link" data-toggle="dropdown" aria-expanded="false" href="#s">
                    <span className="d-none d-lg-inline mr-2 text-gray-600 small">{`${user.firstname} ${user.lastname}`}</span>
                    <img className="border rounded-circle img-profile" src="assets/img/avatars/avatar1.jpeg" alt="" />
                  </a>
                  <div className="dropdown-menu shadow dropdown-menu-right animated--grow-in" role="menu">
                    <span onClick={signOutUser} className="dropdown-item" role="presentation"><i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Logout</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        <div className="container-fluid">{children}</div>
      </div>
      <footer className="bg-white sticky-footer">
        <div className="container my-auto">
          <div className="text-center my-auto copyright"><span>Copyright © ElectionBuddy 2023</span></div>
        </div>
      </footer>
    </div>
    <a className="border rounded d-inline scroll-to-top" href="#spage-top"><i className="fas fa-angle-up"></i></a>
  </div>)
}