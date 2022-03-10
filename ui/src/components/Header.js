import React,{useContext} from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
const Header = () => {
    let {user} = useContext(AuthContext)
    return (
    <div>
        <Link to="/">Home</Link>
        <span> | </span>
        {user ? (
            <p> logout </p>
        ):(
            <Link to="login">Login</Link>
        )}
        {user && <p> hello {user.username}</p>}
    </div>
  )
}

export default Header