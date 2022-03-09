import { Switch, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage';

const PrivateRoute = ({Child}) => {
    const authenticated = false
    return(
        !authenticated ? <Navigate to= "/login"/> : <Child/>
    )
}

export default PrivateRoute;