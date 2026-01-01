import { API_BASE_URL } from './config';

// --- 类型定义 ---

// 对应后端的 VideoOut schema (API 返回的数据)
export interface Video {
  id: number;
  name: string;
  ip_address: string;
  port: number;
  username?: string; // 补全：用于编辑回显
  password?: string; // 补全：用于编辑回显
  stream_url?: string; // 后端可能返回 null
  status: 'online' | 'offline';
  is_active: number;
  remark?: string;
  latitude?: number;
  longitude?: number;
}

// 对应后端的 VideoCreate schema (创建时提交的数据)
export interface VideoCreate {
  name: string;
  ip_address: string;
  port?: number;      // 后端默认为 80
  username?: string;
  password?: string;
  stream_url?: string; // 改为可选，允许为空
  status?: 'online' | 'offline';
  remark?: string;
}

// 对应后端的 VideoUpdate schema (更新时提交的数据)
export interface VideoUpdate {
  name?: string;
  ip_address?: string;
  port?: number;
  username?: string;
  password?: string;
  stream_url?: string;
  status?: 'online' | 'offline';
  remark?: string;
  is_active?: number;
}

export interface StreamUrl {
  url: string;
}

// --- API 方法 ---

/** 获取所有视频设备列表 */
export async function getAllVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/video/`);
  if (!response.ok) throw new Error('Failed to fetch videos');
  return response.json();
}

/** 创建新的视频设备 */
export async function createVideo(videoData: VideoCreate): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/video/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(videoData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create video');
  }
  return response.json();
}

/** 更新视频设备信息 (补充缺失的方法) */
export async function updateVideo(id: number, videoData: VideoUpdate): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/video/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(videoData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update video');
  }
  return response.json();
}

/** 删除指定的视频设备 */
export async function deleteVideo(videoId: number): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/video/${videoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete video');
  }
  return response.json();
}

/** 获取指定设备的视频流地址 */
export async function getVideoStreamUrl(videoId: number): Promise<StreamUrl> {
  const response = await fetch(`${API_BASE_URL}/video/stream/${videoId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get stream URL');
  }
  return response.json();
}

/** 同步设备列表 (补充缺失的方法) */
export async function syncDevices(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/video/sync`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sync devices');
  }
  return response.json();
}

/** 通过 RTSP 地址动态添加摄像头（由 Node Media Server 拉流转码） */
export async function addCameraViaRTSP(cameraData: {
  name: string;
  rtsp_url: string;
  ip_address?: string;
  port?: number;
  username?: string;
  password?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
}): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/video/add_camera`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cameraData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add camera via RTSP');
  }
  return response.json();
}