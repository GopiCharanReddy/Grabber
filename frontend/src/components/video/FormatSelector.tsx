import { useState } from 'react';
import type { VideoFormat } from '../../types';
import { formatFileSize } from '../../utils/helpers';

interface Props {
  formats: VideoFormat[];
  onDownload: (format: VideoFormat) => void;
  downloadingId?: string;
}

type FormatType = 'video+audio' | 'video' | 'audio';

export default function FormatSelector({ formats, onDownload, downloadingId }: Props) {
  const [selectedType, setSelectedType] = useState<FormatType>('video+audio');

  if (!formats?.length) return <div className="text-gray-500">No formats available.</div>;

  const formatsByType = formats.reduce((acc, format) => {
    if (!acc[format.type]) {
      acc[format.type] = [];
    }
    acc[format.type].push(format);
    return acc;
  }, {} as Record<FormatType, VideoFormat[]>);

  const formatCounts = {
    'video+audio': formatsByType['video+audio']?.length || 0,
    'video': formatsByType['video']?.length || 0,
    'audio': formatsByType['audio']?.length || 0
  };

  return (
    <div className="space-y-4">
      {/* Format Type Tabs */}
      <div className="flex gap-2 border-b">
        {(['video+audio', 'video', 'audio'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              selectedType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} ({formatCounts[type]})
          </button>
        ))}
      </div>

      {/* Format Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Format</th>
              <th className="p-2 border">Quality</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Download</th>
            </tr>
          </thead>
          <tbody>
            {formatsByType[selectedType]?.map((format) => (
              <tr key={format.formatId} className="even:bg-gray-50">
                <td className="p-2 border">{format.extension.toUpperCase()}</td>
                <td className="p-2 border">{format.quality}</td>
                <td className="p-2 border">{formatFileSize(format.fileSize)}</td>
                <td className="p-2 border">
                  <button
                    className="bg-green-600 text-white rounded px-3 py-1 text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={downloadingId === format.formatId}
                    onClick={() => onDownload(format)}
                  >
                    {downloadingId === format.formatId ? 'Downloading...' : 'Download'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 