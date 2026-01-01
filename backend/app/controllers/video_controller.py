from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
# 统一使用 video_schema 以匹配模块结构
from app.schemas.video_schema import VideoCreate, VideoOut, VideoUpdate, CameraCreateRequest
from app.services.video_service import VideoService
import cv2
import time
import threading

router = APIRouter(prefix="/video", tags=["Video Surveillance"])
service = VideoService()

@router.post("/add_camera", response_model=VideoOut)
def add_camera_dynamically(camera: CameraCreateRequest, db: Session = Depends(get_db)):
    """
    Dynamically adds a new camera by commanding the media server
    and then creating a record in the database.
    """
    try:
        return service.add_camera_to_media_server(db, camera)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[VideoOut])
def read_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有视频设备列表"""
    return service.get_videos(db, skip=skip, limit=limit)

@router.post("/", response_model=VideoOut)
def create_video(video: VideoCreate, db: Session = Depends(get_db)):
    """手动创建/添加视频设备"""
    try:
        return service.create_video(db, video)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{video_id}", response_model=VideoOut)
def update_video(video_id: int, video: VideoUpdate, db: Session = Depends(get_db)):
    """更新视频设备信息"""
    updated_video = service.update_video(db, video_id, video)
    if not updated_video:
        raise HTTPException(status_code=404, detail="Video device not found")
    return updated_video

@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """删除视频设备"""
    success = service.delete_video(db, video_id)
    if not success:
        raise HTTPException(status_code=404, detail="Video device not found")
    return {"status": "success"}

@router.post("/sync")
def sync_devices(db: Session = Depends(get_db)):
    """从海康威视等平台同步设备列表"""
    service.sync_hikvision_devices(db)
    return {"message": "Sync started"}

@router.get("/stream/{video_id}")
def get_video_stream(video_id: int, db: Session = Depends(get_db)):
    """获取指定设备的流媒体地址"""
    url = service.get_stream_url(db, video_id)
    if not url:
        raise HTTPException(status_code=404, detail="Stream URL not found or device offline")
    return {"url": url}


def _mjpeg_frame_generator(rtsp_url: str):
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        # 延时重试几次，避免瞬时失败
        for _ in range(5):
            time.sleep(0.3)
            cap.open(rtsp_url)
            if cap.isOpened():
                break
    if not cap.isOpened():
        # 生成一个空白帧作为错误提示
        img = (255 * (1 - 0)).astype('uint8') if False else None
        # 无法打开时直接结束生成器
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.05)
                continue
            # 可按需缩放，减少带宽/CPU
            # frame = cv2.resize(frame, (960, 540))
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ret:
                continue
            jpg_bytes = buffer.tobytes()
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + jpg_bytes + b"\r\n")
            time.sleep(0.03)  # ~30fps 限速，防止过载
    finally:
        cap.release()


@router.get("/mjpeg/{video_id}")
def get_video_mjpeg(video_id: int, db: Session = Depends(get_db)):
    """
    提供简易 MJPEG 实时预览流（multipart/x-mixed-replace）。
    适合快速演示，但占用 CPU，生产建议接入 MediaMTX/ZLMediaKit 或 HLS/WebRTC。
    """
    url = service.get_stream_url(db, video_id)
    if not url:
        raise HTTPException(status_code=404, detail="Stream URL not found or device offline")
    return StreamingResponse(_mjpeg_frame_generator(url), media_type="multipart/x-mixed-replace; boundary=frame")