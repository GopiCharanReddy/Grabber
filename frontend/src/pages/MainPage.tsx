import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import VideoDownloader from '../components/video/VideoDownloader';

export default function MainPage() {
  const { user, signout } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return (
    <div>
      <div className="flex justify-end p-4">
        <button onClick={signout} className="bg-red-500 text-white rounded px-4 py-2">Sign Out</button>
      </div>
      <VideoDownloader />
    </div>
  );
} 