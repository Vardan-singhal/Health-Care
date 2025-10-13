import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthStart, setAuthSuccess, setAuthFailure } from '../features/authSlice';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    dispatch(setAuthStart());
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        uid: cred.user.uid,
        email: cred.user.email,
        name: cred.user.displayName || cred.user.email,
        role: 'patient', // default, can fetch from Firestore
      };
      dispatch(setAuthSuccess({ user, token: cred.user.accessToken, role: user.role }));
      nav('/doctors');
    } catch (err) {
      dispatch(setAuthFailure(err.message));
      setError(err.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm p-4" style={{ maxWidth: 400, width: '100%' }}>
        <h3 className="text-center mb-4">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handle}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">Login</button>
          </div>

          <div className="text-center">
            <span>Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
