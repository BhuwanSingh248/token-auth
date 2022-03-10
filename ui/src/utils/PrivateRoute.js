import { useContext } from 'react';
import { Switch, Navigate } from 'react-router-dom'
import AuthContext from '../context/AuthContext';
import HomePage from '../pages/HomePage';

const PrivateRoute = ({Child}) => {
    
    let {user} = useContext(AuthContext)
    let authenticated = true
    return(
        !user ? <Navigate to= "/login"/> : <Child/>
    )
}

export default PrivateRoute;