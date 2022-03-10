import React, { Component } from 'react';
import {BrowserRouter as Router ,Routes, Route} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';


class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <h1>hi their</h1> */}
        <Router>
          <AuthProvider>
            <Header/>
            <Routes>
              <Route path='/' element={
                <PrivateRoute Child = {HomePage}/> }  exact/>
              <Route element={<LoginPage/>} path="/login" />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    );
  }
}

export default App;
