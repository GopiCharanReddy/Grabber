import { Routes, Route, Navigate } from 'react-router-dom';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
