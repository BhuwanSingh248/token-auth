import { Switch, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage';

const PrivateRoute = ({Child}) => {
    const authenticated = true
    return(
        !authenticated ? <Navigate to= "/login"/> : <Child/>
    )
}

export default PrivateRoute;