import cv2
import os
import time
# 移除顶部的 YOLO 导入，防止启动时冲突 (我们在函数里导入)
from ultralytics import YOLO 
import numpy as np

class AIService:
    def __init__(self, model_path="app/models/best.pt", cooldown_seconds=5):
        # 1. 基础配置
        self.model_path = model_path
        self.model = None
        self.cooldown_seconds = cooldown_seconds
        self.last_alarm_time = 0
        
        # 🌟🌟🌟【关键修复】必须定义类别映射，否则就会报 AttributeError 🌟🌟🌟
        # 0: 安全帽, 1: 未戴安全帽, 2: 人员 (请根据你训练的模型实际 ID 修改)
        self.class_names = {0: 'helmet', 1: 'no_helmet', 2: 'person'}

    def _load_model_safe(self):
        """延迟加载模型，确保在需要的时候才初始化"""
        if self.model is not None:
            return True

        try:
            print("⏳ [AI服务] 正在初始化模型 (CPU模式)...")
            # 获取当前工作目录 (backend/)
            base_dir = os.getcwd()
            # 拼接绝对路径
            full_path = os.path.join(base_dir, self.model_path)
            
            print(f"🛠️ [调试] 模型路径: {full_path}")

            if not os.path.exists(full_path):
                print(f"❌ [错误] 找不到模型文件: {full_path}")
                return False

            # 加载模型
            loaded_model = YOLO(full_path)
            
            # 强制 CPU，避免 5060 显卡驱动冲突
            loaded_model.to('cpu')
            
            self.model = loaded_model
            print("✅ [AI服务] 模型加载完成")
            return True
        except Exception as e:
            print(f"❌ [严重错误] 模型加载失败: {e}")
            return False

    def detect_safety_helmet(self, frame):
        # 1. 确保模型已加载
        if self.model is None:
            if not self._load_model_safe():
                return False, None

        if frame is None:
            return False, None

        try:
            # 2. 推理 (增加 verbose=False 防止控制台刷屏)
            results = self.model(frame, conf=0.5, verbose=False)[0]
            
            has_violation = False
            box_coords = []
            conf_score = 0.0

            # 3. 解析结果
            for box in results.boxes:
                cls_id = int(box.cls[0])
                
                # 这里就是之前报错的地方，现在 self.class_names 已经存在了
                label = self.class_names.get(cls_id, 'unknown')
                
                # 只有 "no_helmet" 算违规
                if label == 'no_helmet':
                    has_violation = True
                    conf_score = float(box.conf[0])
                    box_coords = box.xyxy[0].tolist()
                    break 
            
            # 4. 报警逻辑
            if has_violation:
                current_time = time.time()
                if current_time - self.last_alarm_time > self.cooldown_seconds:
                    self.last_alarm_time = current_time
                    print(f"🚨 [AI监测] 发现违规! (未戴安全帽) 置信度: {conf_score:.2f}")
                    return True, {
                        "type": "未佩戴安全帽",
                        "msg": "检测到人员未佩戴安全帽",
                        "score": conf_score,
                        "coords": box_coords
                    }
            
            return False, None

        except Exception as e:
            print(f"⚠️ 推理过程出错 (已忽略): {e}")
            return False, None

    def count_supervisors(self, frame):
        """
        [修改版] 统计画面中 '监护人' 的数量
        逻辑：检测所有 'helmet' (类ID=0)，并判断颜色是否为红色
        """
        if self.model is None:
            if not self._load_model_safe():
                return 0
        if frame is None: return 0

        try:
            results = self.model(frame, conf=0.5, verbose=False)[0]
            supervisor_count = 0
            
            for box in results.boxes:
                cls_id = int(box.cls[0])
                label = self.class_names.get(cls_id, 'unknown')
                
                # 假设类ID 0 是 'helmet' (安全帽)
                # 或者是检测 'person' 然后切图上半部分也可以，这里假设能检测到 helmet
                if label == 'helmet':
                    # 1. 获取坐标
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    
                    # 2. 裁剪出安全帽的图片
                    helmet_crop = frame[y1:y2, x1:x2]
                    
                    # 3. 识别颜色
                    color = self._get_helmet_color(helmet_crop)
                    
                    # 4. 如果是红色，认定为监护人
                    if color == 'red':
                        supervisor_count += 1
                        # (可选) 在图上画个框标记一下监护人，方便调试
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(frame, "Supervisor", (x1, y1-10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            return supervisor_count

        except Exception as e:
            print(f"⚠️ 监护人统计出错: {e}")
            return 0
        
    # --- 新增：颜色识别辅助函数 ---
    def _get_helmet_color(self, img_crop):
        """
        分析截图的颜色，返回 'red', 'yellow', 'blue', 'white' 或 'unknown'
        使用 HSV 颜色空间进行阈值判断
        """
        if img_crop is None or img_crop.size == 0:
            return 'unknown'

        hsv = cv2.cvtColor(img_crop, cv2.COLOR_BGR2HSV)

        # === 1. 定义红色范围 (红色在HSV圆环的首尾都有) ===
        # 红色的范围通常是 (0-10) 和 (170-180)
        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        
        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)
        red_pixels = cv2.countNonZero(mask_red)

        # === 2. 定义黄色范围 ===
        lower_yellow = np.array([20, 100, 100])
        upper_yellow = np.array([30, 255, 255])
        mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
        yellow_pixels = cv2.countNonZero(mask_yellow)

        # === 3. 比较谁的像素点多 ===
        total_pixels = img_crop.shape[0] * img_crop.shape[1]
        
        # 设定一个阈值，比如只有超过 10% 的面积是红色才算红帽
        if red_pixels > yellow_pixels and red_pixels > (total_pixels * 0.1):
            return 'red'
        elif yellow_pixels > red_pixels and yellow_pixels > (total_pixels * 0.1):
            return 'yellow'
        
        return 'other'