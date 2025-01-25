import { useState } from 'react';
import './App.css';
import NotificationComponent from '@/components/NotificationComponent';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Dustbin from './pages/Dustbin';
import Setting from './pages/Setting';
import Login from './pages/Login';
import Register from './pages/Register';
import DustbinDetailPage from './pages/Dustbin/Detail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <NotificationComponent />
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path='/'
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path='/dashboard'
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path='/dustbin'
              element={(
                <ProtectedRoute>
                  <Dustbin />
                </ProtectedRoute>
              )}
            />
            <Route
              path='/dustbin/:type'
              element={(
                <ProtectedRoute>
                  <DustbinDetailPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path='/setting'
              element={(
                <ProtectedRoute>
                  <Setting />
                </ProtectedRoute>
              )}
            />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
