import { createContext, useState } from "react";
import jwt_decode from "jwt-decode"
import { useNavigate } from 'react-router-dom'
const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) =>{

    let [authToken, setAuthToken] = useState(()=>
        localStorage.getItem('authToken') ? JSON.parse(
            localStorage.getItem('authToken')
            ):null
    )
    let [user, setUser] = useState( ()=>
        localStorage.getItem('authToken') ? jwt_decode(
            localStorage.getItem('authToken')
            ):null
    )

    //  setting up token auth from local storage
    const history = useNavigate()

    let loginUser = async(e ) => {
        e.preventDefault()
        // console.log('form submitted');
        let response = await fetch('http://localhost:8000/api/token/',{
          method:'POST',
          headers:{
              'Content-Type':'application/json'
          },  
          body:JSON.stringify({
              'username':e.target.username.value,
              'password':e.target.password.value
          })
        })
        let data = await response.json()
        if(response.status === 200){
            setAuthToken(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authToken', JSON.stringify(data))
            history('/')
        }else{
            alert('Something went wrong!')
        }
    }

    let contextData = {
        user:user,
        loginUser:loginUser
    }
    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}