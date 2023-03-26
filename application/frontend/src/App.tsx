import React from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { LoggedInRedirect, ProtectedRoute } from './helpers/routes';
import AddBallot from './pages/addballot';
import Ballot from './pages/ballot';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import backendApi from './utils/backendApi';

function App() {
  const { user } = useSelector((state: UserState) => state);
  

  const [ballots, setBallots] = React.useState<IBallot[]>([]);

  useQuery('ballots', function() {
    return backendApi.getBallots();
  }, { onSuccess: function(data) {
    if(data.status === 1) {
      setBallots(data.ballots);
    }
  }, enabled: !!user.isAuthenticated })

  return (
    <Routes>
      <Route path='/' element={
        <ProtectedRoute user={user}>
          <Home ballots={ballots} user={user} />
        </ProtectedRoute>
      } />
      <Route path='/ballot/:id' element={
        <ProtectedRoute user={user}>
          <Ballot ballots={ballots} user={user} />
        </ProtectedRoute>
      } />
      <Route path='/addballot' element={
        <ProtectedRoute user={user}>
          <AddBallot user={user} />
        </ProtectedRoute>
      } />
      {/* user not logged in routes */}
      <Route path="/login" element={
        <LoggedInRedirect user={user} redirectPath='/'>
          <Login />
        </LoggedInRedirect>
      } />
      <Route path="/register" element={
        <LoggedInRedirect user={user} redirectPath='/'>
          <Register />
        </LoggedInRedirect>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
