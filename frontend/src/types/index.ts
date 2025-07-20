// Backend auth types
export interface User {
  email: string;
}

export interface AuthResponse {
  token?: string;
  message: string;
}

export interface VideoFormat {
  formatId: string;
  extension: string;
  quality: string;
  fileSize: number;
  type: "video" | "audio" | "video+audio";
}

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  formats: VideoFormat[];
}

export interface ApiError {
  message: string;
} 