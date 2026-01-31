import threading
import time
import cv2
import os
import uuid
from datetime import datetime
from app.services.ai_service import AIService
from app.models.alarm_records import AlarmRecord
from app.core.database import SessionLocal

class AIManager:
    def __init__(self):
        self.active_monitors = {} # device_id -> {"stop_event": Event, "thread": Thread}
        
        # 初始化 AI 服务
        self.ai_service = AIService()
        
        # 确保报警图片保存目录存在
        # 路径: backend/static/alarms
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.static_dir = os.path.join(self.base_dir, "static", "alarms")
        os.makedirs(self.static_dir, exist_ok=True)

    def start_monitoring(self, device_id, rtsp_url, algo_type="helmet"):
        if device_id in self.active_monitors:
            print(f"⚠️ 设备 {device_id} 已经在监控中")
            return False

        print(f"--- 启动 AI 监控: {device_id} | 模式: {algo_type} ---")
        stop_event = threading.Event()
        
        thread = threading.Thread(
            target=self._monitor_loop,
            args=(device_id, rtsp_url, algo_type, stop_event), # 传参
            daemon=True
        )
        self.active_monitors[device_id] = {"stop_event": stop_event, "thread": thread}
        thread.start()
        return True

    def stop_monitoring(self, device_id):
        """停止监控"""
        if device_id not in self.active_monitors:
            return False
            
        print(f"--- 停止 AI 监控: {device_id} ---")
        self.active_monitors[device_id]["stop_event"].set()
        # 从字典中移除（线程会稍后自动退出）
        del self.active_monitors[device_id]
        return True

    def _monitor_loop(self, device_id, rtsp_url, algo_type, stop_event):
        # ... 连接视频流代码保持不变 ...
        print(f"📷 正在连接视频流: {rtsp_url}")
        try:
            if rtsp_url == "0": rtsp_url = 0
            cap = cv2.VideoCapture(rtsp_url)
        except Exception as e:
            print(f"❌ 视频流打开失败: {e}")
            return

        frame_interval = 5 
        frame_count = 0

        # === 离岗检测专用变量 ===
        last_seen_person_time = time.time() # 上次看到人的时间
        # ⚠️⚠️⚠️【重要】测试时设为 15 秒，正式上线请改为 300 (5分钟)
        OFF_POST_THRESHOLD = 15 
        is_already_alarmed = False # 防止一直重复报警

        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                time.sleep(2)
                continue

            frame_count += 1
            if frame_count % frame_interval != 0:
                continue

            # ================== 核心逻辑分支 ==================
            
            # 👉 模式 A: 安全帽检测 (瞬间触发)
            if algo_type == "helmet":
                is_alarm, details = self.ai_service.detect_safety_helmet(frame)
                if is_alarm:
                    print(f"🚨 [安全帽] 发现违规！")
                    img_path = self._save_alarm_image(frame, device_id)
                    self._save_alarm_to_db(device_id, details, img_path)

            # 👉 模式 B: 监护人离岗检测 (时间段触发)
            elif algo_type == "off_post":
                supervisor_count = self.ai_service.count_supervisors(frame)
                
                if supervisor_count > 0:
                    # 有人在岗 -> 重置计时
                    last_seen_person_time = time.time()
                    if is_already_alarmed:
                        print("✅ [离岗检测] 监护人已回归，解除警报状态")
                        is_already_alarmed = False
                else:
                    # 无人 -> 计算离岗时间
                    duration = time.time() - last_seen_person_time
                    
                    if duration > OFF_POST_THRESHOLD and not is_already_alarmed:
                        print(f"🚨 [离岗检测] 已离岗 {int(duration)} 秒！触发报警！")
                        
                        # 触发报警
                        img_path = self._save_alarm_image(frame, device_id)
                        details = {
                            "type": "监护人员离岗",
                            "msg": f"监护人离岗超过 {int(OFF_POST_THRESHOLD)} 秒"
                        }
                        self._save_alarm_to_db(device_id, details, img_path)
                        
                        is_already_alarmed = True # 标记已报警，避免每帧都存数据库

            # ================================================

            time.sleep(0.02)

        cap.release()
        print(f"--- 监控线程已退出: {device_id} ---")

    def _save_alarm_image(self, frame, device_id):
        """将违规画面保存为文件，返回相对路径"""
        try:
            # 生成文件名: device_timestamp_uuid.jpg
            filename = f"{device_id}_{int(time.time())}_{uuid.uuid4().hex[:6]}.jpg"
            filepath = os.path.join(self.static_dir, filename)
            
            # 保存图片
            cv2.imwrite(filepath, frame)
            
            # 返回给前端用的相对路径 (假设前端可以通过 /static/alarms/ 访问)
            return f"/static/alarms/{filename}"
        except Exception as e:
            print(f"❌ 图片保存失败: {e}")
            return ""

    def _save_alarm_to_db(self, device_id, details, image_path):
        """保存报警记录到数据库"""
        if not details:
            return

        db = SessionLocal()
        try:
            # 创建记录
            record = AlarmRecord(
                device_id=str(device_id),
                alarm_type=details.get('type', 'unknown'),
                severity="HIGH", # 默认为高优先级
                
                # ✅ 使用你数据库里的正确字段名
                description=details.get('msg', '检测到异常'),
                recording_path=image_path,
                
                status="pending",
                timestamp=datetime.now()
            )
            
            db.add(record)
            db.commit()
            print(f"✅ [数据库] 报警记录已保存 (ID: {record.id})")
            
        except Exception as e:
            print(f"❌ 数据库保存失败: {e}")
            db.rollback()
        finally:
            db.close()

# 全局单例
ai_manager = AIManager()