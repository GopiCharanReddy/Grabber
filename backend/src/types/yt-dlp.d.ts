export interface YtDlpRawFormat {
  format_id: string;
  url: string;
  ext: string;
  protocol?: string;
  format_note?: string;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  height?: number;
  width?: number;
  abr?: number;
  tbr?: number;
  resolution?: string;
}
