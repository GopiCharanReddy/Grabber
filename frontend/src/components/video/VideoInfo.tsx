import type { VideoInfo, VideoFormat } from '../../types';
import FormatSelector from './FormatSelector';

interface Props {
  info?: VideoInfo;
  onDownload: (format: VideoFormat) => void;
  downloadingId?: string;
}

export default function VideoInfoDisplay({ info, onDownload, downloadingId }: Props) {
  if (!info) return null;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <img 
            src={info.thumbnail} 
            alt={info.title} 
            className="w-full rounded shadow"
          />
        </div>
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-2">{info.title}</h2>
          <p className="text-gray-600">Duration: {formatDuration(info.duration)}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Available Formats</h3>
        <FormatSelector 
          formats={info.formats} 
          onDownload={onDownload} 
          downloadingId={downloadingId}
        />
      </div>
    </div>
  );
} 