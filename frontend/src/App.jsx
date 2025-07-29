import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8080'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwtToken'))

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage('') // Clear message when typing
  }

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}|,.<>/?-]).{8,100}$/
    return passwordPattern.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Client-side validation
    if (!formData.email || !formData.password) {
      setMessage('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!isLogin && !validatePassword(formData.password)) {
      setMessage('Password must be at least 8 characters with uppercase letter and special character')
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/users/login/' : '/users/register/'
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData)

      if (isLogin) {
        // Handle login success
        const { userId, jwtToken } = response.data
        localStorage.setItem('jwtToken', jwtToken)
        localStorage.setItem('userId', userId.toString())
        setIsLoggedIn(true)
        setMessage('Login successful!')
      } else {
        // Handle registration success
        setMessage('Account created successfully! You can now login.')
        setIsLogin(true) // Switch to login form
      }
      
      setFormData({ email: '', password: '' })
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setMessage(error.response.data || 'Invalid input')
            break
          case 409:
            setMessage('Email already exists')
            break
          case 429:
            setMessage('Too many requests. Please try again later.')
            break
          default:
            setMessage('An error occurred. Please try again.')
        }
      } else {
        setMessage('Unable to connect to server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userId')
    setIsLoggedIn(false)
    setMessage('')
  }

  const fetchKey = async () => {
    try {
      const token = localStorage.getItem('jwtToken')
      const userId = localStorage.getItem('userId')
      
      const response = await axios.post(
        `${API_BASE_URL}/fetchKeys/`,
        { userId: parseInt(userId) },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      setMessage(`Key fetched: ${response.data.key}`)
    } catch (error) {
      if (error.response?.status === 429) {
        setMessage('Rate limit exceeded. Please try again later.')
      } else if (error.response?.status === 401) {
        setMessage('Session expired. Please login again.')
        handleLogout()
      } else {
        setMessage('Failed to fetch key')
      }
    }
  }

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="container">
          <div className="form-container">
            <h1>Welcome!</h1>
            <p>You are successfully logged in.</p>
            <button onClick={fetchKey} className="submit-btn">
              Fetch Key
            </button>
            <button onClick={handleLogout} className="switch-btn">
              Logout
            </button>
            {message && <div className="message success">{message}</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <div className="form-container">
          <h1>macrofirm keygen</h1>
          
          <div className="form-switch">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => { setIsLogin(true); setMessage(''); setFormData({ email: '', password: '' }); }}
            >
              Login
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => { setIsLogin(false); setMessage(''); setFormData({ email: '', password: '' }); }}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* {isLogin && (
              <div className="forgot-password">
                <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )} */}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign up')}
            </button>
          </form>

          <div className="switch-form">
            {isLogin ? (
              <p>Not a member? <span onClick={() => { setIsLogin(false); setMessage(''); }} className="switch-link">Signup now</span></p>
            ) : (
              <p>Already a member? <span onClick={() => { setIsLogin(true); setMessage(''); }} className="switch-link">Login now</span></p>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('successful') || message.includes('Key fetched') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
