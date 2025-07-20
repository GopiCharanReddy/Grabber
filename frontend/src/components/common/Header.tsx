import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, signout } = useAuth();
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-blue-700 text-white">
      <div className="font-bold text-lg">Video Downloader</div>
      {user && (
        <button onClick={signout} className="bg-red-500 px-3 py-1 rounded text-white">Logout</button>
      )}
    </header>
  );
} 