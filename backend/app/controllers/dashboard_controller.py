from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

# 按你项目实际 get_db 路径调整：
# 你之前的项目结构里很像是 app/core/database.py
from app.core.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """
    顶部三张卡片统计：
    - fenceCount: 电子围栏数量
    - alarmCount: 今日报警数量（使用 alarm_records.timestamp）
    - deviceCount: 设备数量
    """
    # 设备数量
    device_count = db.execute(
        text("SELECT COUNT(*) FROM devices")
    ).scalar() or 0

    # 今日报警数量（你的表字段名就是 timestamp）
    alarm_count = db.execute(
        text("""
            SELECT COUNT(*)
            FROM alarm_records
            WHERE DATE(`timestamp`) = CURDATE()
        """)
    ).scalar() or 0

    # 围栏数量
    fence_count = db.execute(
        text("SELECT COUNT(*) FROM electronic_fences")
    ).scalar() or 0

    return {
        "fenceCount": int(fence_count),
        "alarmCount": int(alarm_count),
        "deviceCount": int(device_count),
    }


@router.get("/branches")
def list_branches(db: Session = Depends(get_db)):
    """
    分公司列表：给前端地图展示使用
    前端需要 coord: [lng, lat]（经度在前）
    """
    rows = db.execute(text("""
        SELECT
          id, province, name, lng, lat, address, project, manager, phone,
          device_count, status, updated_at, remark
        FROM branches
        ORDER BY id ASC
    """)).mappings().all()

    data = []
    for r in rows:
        coord = None
        if r["lng"] is not None and r["lat"] is not None:
            coord = [float(r["lng"]), float(r["lat"])]

        data.append({
            "id": int(r["id"]),
            "province": r.get("province") or "",
            "name": r.get("name") or "",
            "coord": coord,  # [lng, lat]
            "address": r.get("address"),
            "project": r.get("project"),
            "manager": r.get("manager"),
            "phone": r.get("phone"),
            "deviceCount": int(r.get("device_count") or 0),
            "status": r.get("status") or "正常",
            "updatedAt": str(r.get("updated_at")) if r.get("updated_at") else None,
            "remark": r.get("remark"),
        })

    return data
