import { useState } from 'react';
import { fetchVideoInfo, downloadVideo } from '../../services/api';
import type { VideoInfo, VideoFormat } from '../../types';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import VideoInfoDisplay from './VideoInfo';

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | undefined>();
  const [downloadingId, setDownloadingId] = useState<string | undefined>();

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setError(undefined);
    setVideoInfo(undefined);
    setLoading(true);

    try {
      console.log('Fetching video info for:', url);
      
      // Check if URL is valid
      try {
        new URL(url); // This will throw if URL is invalid
      } catch (e) {
        throw new Error('Invalid URL format');
      }
      
      const data = await fetchVideoInfo(url);
      console.log('Video info response:', data);
      
      if (!data) {
        throw new Error('No data received from server');
      }

      if (!Array.isArray(data.formats)) {
        console.error('Invalid formats array:', data.formats);
        throw new Error('Invalid format data received');
      }

      setVideoInfo(data);
    } catch (e: any) {
      console.error('Video info error:', e);
      // Handle different types of errors
      if (e.message === 'Network Error') {
        setError('Cannot connect to server. Please check your internet connection or try again later.');
      } else if (e.response?.status === 500) {
        setError('Server error. The video might be unavailable or restricted.');
      } else {
        setError(e.response?.data?.message || e.message || 'Failed to fetch video info');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: VideoFormat) => {
    setDownloadingId(format.formatId);
    setError(undefined);

    try {
      console.log('Downloading format:', format);
      const blob = await downloadVideo({
        url,
        formatId: format.formatId,
        ext: format.extension
      });
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `${videoInfo?.title || 'video'}.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(a.href);
    } catch (e: any) {
      console.error('Download error:', e);
      // Handle download-specific errors
      if (e.message === 'Network Error') {
        setError('Download failed. Please check your connection and try again.');
      } else if (e.response?.status === 413) {
        setError('File is too large to download. Try a smaller format.');
      } else {
        setError(e.response?.data?.message || e.message || 'Download failed');
      }
    } finally {
      setDownloadingId(undefined);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-4 bg-white rounded shadow">
      <form onSubmit={handleFetchInfo} className="flex flex-col gap-4 mb-6">
        <input
          type="url"
          placeholder="Paste video URL here..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition-colors disabled:opacity-50" 
          disabled={loading || !url.trim()}
        >
          {loading ? 'Loading...' : 'Start'}
        </button>
      </form>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {videoInfo && (
        <VideoInfoDisplay 
          info={videoInfo} 
          onDownload={handleDownload} 
          downloadingId={downloadingId} 
        />
      )}
    </div>
  );
} 