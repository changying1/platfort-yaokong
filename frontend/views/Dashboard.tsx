import React, { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

// ✅ 这里的路径你按你的项目结构改一下：
// 常见情况：Dashboard.tsx 在 src/views/ 里 -> "../assets/china.json"
// 如果你的是 src/assets/china.json，就改成对应相对路径
import chinaJson from "../src/assets/china.json";

type BranchStatus = "正常" | "告警" | "离线";

type Branch = {
  id: number;
  province: string;
  name: string;
  coord?: [number, number]; // [lng, lat]
  address?: string;
  project?: string;
  manager?: string;
  phone?: string;
  deviceCount?: number;
  status?: BranchStatus;
  updatedAt?: string;
  remark?: string;
};

type Summary = {
  fenceCount: number;
  alarmCount: number;
  deviceCount: number;
};

// 只注册一次地图
if (!echarts.getMap("china")) {
  echarts.registerMap("china", chinaJson as any);
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary>({
    fenceCount: 0,
    alarmCount: 0,
    deviceCount: 0,
  });

  // ✅ 记录 summary 获取时间（展示用，不影响业务）
  const [summaryFetchedAt, setSummaryFetchedAt] = useState<string>("");

  // ✅ 分公司列表：从后端读取
  const [branches, setBranches] = useState<Branch[]>([]);

  // ✅ 当前选中的分公司（用于右侧弹窗）
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // 你现在的界面没有省份筛选的话，先固定全部
  const selectedProvince = "全部";

  // 顶部统计
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error(`summary http ${res.status}`);
        const data = await res.json();

        setSummary({
          fenceCount: Number(data?.fenceCount ?? 0),
          alarmCount: Number(data?.alarmCount ?? 0),
          deviceCount: Number(data?.deviceCount ?? 0),
        });

        setSummaryFetchedAt(new Date().toLocaleString());
      } catch (e) {
        console.error("summary fetch failed:", e);
      }
    })();
  }, []);

  // ✅ 分公司列表
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/branches");
        if (!res.ok) throw new Error(`branches http ${res.status}`);
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("branches fetch failed:", e);
        setBranches([]);
      }
    })();
  }, []);

  // ✅ 让地图整体略向右（经度 105 左右），消除右侧留白
const selectedCenter = useMemo(() => [108, 35] as [number, number], []);


  const mapOption = useMemo(() => {
    const visibleBranches =
      selectedProvince === "全部"
        ? branches
        : branches.filter((b) => b.province === selectedProvince);

    const highlighted =
      selectedProvince === "全部"
        ? Array.from(new Set(branches.map((b) => b.province)))
        : [selectedProvince];

    const branchPoints = visibleBranches
      .filter((b) => Array.isArray(b.coord) && b.coord.length === 2)
      .map((b) => ({
        id: b.id,
        name: b.name,
        province: b.province,
        address: b.address ?? "",
        value: [b.coord![0], b.coord![1], 1], // [lng, lat, weight]
      }));

    const MAP_AREA = "#3b78a6";
    const MAP_AREA_HL = "#5a96c8";
    const MAP_AREA_HOVER = "#6aa2cf";

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15,23,42,0.92)",
        borderColor: "rgba(59,130,246,0.25)",
        borderWidth: 1,
        textStyle: { color: "#e2e8f0" },
        extraCssText: "border-radius:12px; padding:10px 12px;",
        formatter: (params: any) => {
          const isPoint =
            params?.seriesType === "effectScatter" ||
            params?.seriesType === "scatter";

          if (isPoint) {
            const d = params.data || {};
            const lng = Array.isArray(d.value) ? d.value[0] : "";
            const lat = Array.isArray(d.value) ? d.value[1] : "";
            const addr = (d.address ?? "").trim() || "—";

            return `
              <div style="font-weight:900; font-size:13px; margin-bottom:6px;">
                ${d.name ?? ""}
              </div>
              <div style="opacity:.95; line-height:1.7;">
                <div><span style="opacity:.75;">省份：</span>${d.province ?? ""}</div>
                <div><span style="opacity:.75;">地址：</span>${addr}</div>
                <div style="opacity:.7; margin-top:6px;">
                  坐标：${lng}, ${lat}
                </div>
              </div>
            `;
          }
          return params?.name ?? "";
        },
      },

      geo: {
        map: "china",
        roam: true,
        zoom: selectedProvince === "全部" ? 1.23 : 2.25,
        center: selectedCenter,

        itemStyle: {
          areaColor: MAP_AREA,
          borderColor: "#3b82f6",
          borderWidth: 1.2,
          shadowColor: "rgba(59,130,246,0.25)",
          shadowBlur: 18,
        },

        label: {
          show: true,
          color: "rgba(255,255,255,0.72)",
          fontSize: 11,
        },

        emphasis: {
          itemStyle: {
            areaColor: MAP_AREA_HOVER,
            borderColor: "#60a5fa",
            borderWidth: 1.5,
            shadowColor: "rgba(96,165,250,0.55)",
            shadowBlur: 22,
          },
          label: {
            color: "rgba(255,255,255,0.92)",
            fontWeight: "bold",
          },
        },

        regions: highlighted.map((name) => ({
          name,
          itemStyle: {
            areaColor: MAP_AREA_HL,
            borderColor: "#38bdf8",
            borderWidth: 2,
            shadowColor: "rgba(56,189,248,0.55)",
            shadowBlur: 24,
          },
          label: {
            show: true,
            color: "rgba(255,255,255,0.92)",
            fontWeight: "bold",
          },
        })),
      },

      series: branchPoints.length
        ? [
            // 外层光圈
            {
              type: "scatter",
              coordinateSystem: "geo",
              symbolSize: 22,
              itemStyle: {
                color: "rgba(56,189,248,0.18)",
                borderColor: "rgba(56,189,248,0.55)",
                borderWidth: 1.4,
              },
              data: branchPoints,
              tooltip: { show: false },
              silent: true,
              zlevel: 2,
            },

            // 带涟漪的点 + label
            {
              name: "分公司",
              type: "effectScatter",
              coordinateSystem: "geo",
              zlevel: 3,
              rippleEffect: { scale: 4.0, brushType: "stroke" },
              symbolSize: 13,
              itemStyle: {
                color: "#38bdf8",
                shadowBlur: 20,
                shadowColor: "rgba(56,189,248,0.85)",
              },
              label: {
                show: true,
                formatter: "{b}",
                position: "right",
                fontSize: 13,
                fontWeight: "bold",
                color: "#0b2b5a",
                backgroundColor: "rgba(255,255,255,0.92)",
                padding: [4, 8],
                borderRadius: 10,
                borderColor: "rgba(147,197,253,0.9)",
                borderWidth: 1,
              },
              data: branchPoints,
            },
          ]
        : [],
    };
  }, [selectedProvince, selectedCenter, branches]);

  // 点击分公司点位打开弹窗；点其他地方关闭
  const onChartEvents = useMemo(() => {
    return {
      click: (params: any) => {
        if (params?.seriesType === "effectScatter") {
          const name = params?.name;
          const b = branches.find((x) => x.name === name) || null;
          setSelectedBranch(b);
          return;
        }
        setSelectedBranch(null);
      },
    };
  }, [branches]);

  const statusColor = (s?: BranchStatus) => {
    if (s === "告警") return "#dc2626";
    if (s === "离线") return "#f59e0b";
    return "#16a34a";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* 顶栏 */}
        <div style={styles.headerRow}>
          <div>
            <div style={styles.title}>公司安全监控系统</div>
            <div style={styles.subTitle}>
              实时统计 · 全国分公司分布 · 报警与设备概览
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.pill}>10°C</div>
            <div style={styles.pill}>2026/01/20</div>
            <div style={styles.pill}>15:05:38</div>
          </div>
        </div>

        {/* 三张卡片（无下拉） */}
        <div style={styles.cardsRow3}>
          <div style={styles.card}>
            <div style={styles.cardGlowGreen} />
            <div style={styles.cardLabel}>电子围栏数量</div>
            <div style={styles.cardValue}>{summary.fenceCount}</div>
            <div style={styles.cardHint}>来源：electronic_fences · COUNT(*)</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardGlowRed} />
            <div style={styles.cardLabel}>报警数量（今日）</div>
            <div style={styles.cardValueRed}>{summary.alarmCount}</div>
            <div style={styles.cardHint}>来源：alarm_records · DATE(timestamp)=CURDATE()</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardGlowBlue} />
            <div style={styles.cardLabel}>设备数量</div>
            <div style={styles.cardValueBlue}>{summary.deviceCount}</div>
            <div style={styles.cardHint}>来源：devices · COUNT(*)</div>
          </div>
        </div>

        {/* 地图区域 */}
        <div style={styles.middleRow}>
          <div style={styles.mapCard}>
            <div style={styles.mapTitle}>
              <span style={styles.mapDot} />
              全国分公司部署地图（拖拽/滚轮缩放）
              <span style={styles.mapMeta}>
                {summaryFetchedAt ? `统计更新时间：${summaryFetchedAt}` : ""}
              </span>
            </div>

            <div style={styles.mapWrap}>
              <ReactECharts
                option={mapOption}
                style={{ width: "100%", height: "100%" }}
                notMerge
                lazyUpdate
                onEvents={onChartEvents}
              />

              {/* 右侧弹窗 */}
              {selectedBranch && (
                <div style={styles.popup}>
                  <div style={styles.popupHeader}>
                    <div style={styles.popupTitle}>{selectedBranch.name}</div>
                    <button
                      style={styles.popupClose}
                      onClick={() => setSelectedBranch(null)}
                      aria-label="close"
                    >
                      ×
                    </button>
                  </div>

                  <div style={styles.popupBody}>
                    <Row label="省份" value={selectedBranch.province || "—"} />

                    <Row label="地址" value={selectedBranch.address?.trim() || "—"} />

                    <Row
                      label="坐标"
                      value={
                        selectedBranch.coord
                          ? `${selectedBranch.coord[0].toFixed(4)}, ${selectedBranch.coord[1].toFixed(4)}`
                          : "—"
                      }
                    />

                    <Row label="项目" value={selectedBranch.project || "—"} />

                    <Row label="负责人" value={selectedBranch.manager || "—"} />

                    <Row label="电话" value={selectedBranch.phone || "—"} />

                    <Row
                      label="设备数"
                      value={
                        typeof selectedBranch.deviceCount === "number"
                          ? `${selectedBranch.deviceCount} 台`
                          : "—"
                      }
                    />

                    <div style={styles.popupRow}>
                      <span style={styles.popupLabel}>状态：</span>
                      <span
                        style={{
                          ...styles.popupValue,
                          fontWeight: 900,
                          color: statusColor(selectedBranch.status),
                        }}
                      >
                        {selectedBranch.status || "—"}
                      </span>
                    </div>

                    <Row label="更新时间" value={selectedBranch.updatedAt || "—"} />

                    <Row label="备注" value={selectedBranch.remark || "—"} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.popupRow}>
      <span style={styles.popupLabel}>{label}：</span>
      <span style={styles.popupValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(59,130,246,0.14), transparent 60%)," +
      "radial-gradient(1000px 500px at 90% 10%, rgba(34,197,94,0.10), transparent 55%)," +
      "linear-gradient(180deg, #f6f8ff 0%, #f5f7fb 60%, #f4f6fb 100%)",
    padding: 22,
    boxSizing: "border-box",
  },

  container: {
     width: "100%",
     maxWidth: "none",        // ✅ 取消宽度限制
     margin: "0 auto",
     paddingLeft: 12,         // ✅ 左右只留一点空隙
     paddingRight: 12,
     display: "flex",
     flexDirection: "column",
     gap: 14,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(226,232,240,0.85)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    backdropFilter: "blur(10px)",
  },

  title: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: "#0f172a",
  },

  subTitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },

  headerRight: { display: "flex", gap: 8, alignItems: "center" },

  pill: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    color: "#334155",
    boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
  },

  cardsRow3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },

  card: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 16,
    border: "1px solid rgba(226,232,240,0.9)",
    padding: 16,
    boxShadow: "0 14px 36px rgba(15,23,42,0.08)",
    backdropFilter: "blur(10px)",
    position: "relative",
    overflow: "hidden",
  },

  cardGlowBlue: {
    position: "absolute",
    inset: -80,
    background:
      "radial-gradient(circle at 30% 20%, rgba(59,130,246,0.18), transparent 55%)",
    pointerEvents: "none",
  },
  cardGlowGreen: {
    position: "absolute",
    inset: -80,
    background:
      "radial-gradient(circle at 30% 20%, rgba(34,197,94,0.18), transparent 55%)",
    pointerEvents: "none",
  },
  cardGlowRed: {
    position: "absolute",
    inset: -80,
    background:
      "radial-gradient(circle at 30% 20%, rgba(239,68,68,0.18), transparent 55%)",
    pointerEvents: "none",
  },

  cardLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 10,
    position: "relative",
    zIndex: 1,
  },

  cardValue: {
    fontSize: 32,
    fontWeight: 900,
    color: "#0f172a",
    lineHeight: 1,
    position: "relative",
    zIndex: 1,
  },

  cardValueBlue: {
    fontSize: 32,
    fontWeight: 900,
    color: "#2563eb",
    lineHeight: 1,
    position: "relative",
    zIndex: 1,
  },

  cardValueRed: {
    fontSize: 32,
    fontWeight: 900,
    color: "#dc2626",
    lineHeight: 1,
    position: "relative",
    zIndex: 1,
  },

  cardHint: {
    marginTop: 10,
    fontSize: 11,
    color: "#94a3b8",
    position: "relative",
    zIndex: 1,
  },

  middleRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    flex: 1,
    minHeight: 0,
  },

  mapCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    border: "1px solid rgba(226,232,240,0.9)",
    padding: 16,
    boxShadow: "0 18px 46px rgba(15,23,42,0.10)",
    backdropFilter: "blur(10px)",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  mapTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  mapDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#3b82f6",
    display: "inline-block",
    boxShadow: "0 0 0 6px rgba(59,130,246,0.15)",
  },

  mapMeta: {
    marginLeft: 6,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },

  mapWrap: {
    flex: 1,
    marginTop: 12,
    minHeight: 520,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(226,232,240,0.9)",
    background:
      "radial-gradient(900px 400px at 30% 0%, rgba(59,130,246,0.08), transparent 60%)," +
      "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
  },

  popup: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 360,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: 16,
    boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
    overflow: "hidden",
    zIndex: 10,
    backdropFilter: "blur(12px)",
  },

  popupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(226,232,240,0.9)",
    background:
      "linear-gradient(180deg, rgba(59,130,246,0.10), rgba(255,255,255,0.0))",
  },

  popupTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  },

  popupClose: {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: "1px solid rgba(226,232,240,0.9)",
    background: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "26px",
    color: "#334155",
    boxShadow: "0 10px 20px rgba(15,23,42,0.06)",
  },

  popupBody: { padding: 14 },

  popupRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px dashed rgba(226,232,240,0.9)",
  },

  popupLabel: {
    width: 72,
    color: "#64748b",
    fontSize: 12,
    flex: "0 0 auto",
  },

  popupValue: {
    color: "#0f172a",
    fontSize: 12,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
};
