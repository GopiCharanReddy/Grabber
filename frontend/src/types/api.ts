// Authentication responses
export interface AuthSuccessResponse {
  message: string;
  token: string;
}

export interface ErrorResponse {
  message: string;
}

// Video format structure
export interface VideoFormat {
  formatId: string;
  extension: string;
  quality: string;
  fileSize: number;
  type: 'video' | 'audio' | 'video+audio';
}

// Video information response
export interface VideoInfoResponse {
  thumbnail: string;
  title: string;
  duration?: number;
  formats: VideoFormat[];
} 