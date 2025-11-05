import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrackingStatusType } from "@enums";
import "./DonutChart.scss";
import studentListIcon from "/images/icons/student-list.svg";

// #region Declarations
export enum StatusType {
  COMPLETE = "COMPLETE",
  SCHEDULED = "ASSIGNED",
  ACTION_NEEDED = "ACTION_NEEDED",
  UNDER_REVIEW = "UNDER_REVIEW",
  IN_PROGRESS = "IN_PROGRESS",
  UNASSESSED = "UNASSESSED",
}

export const STATUS_COLORS: Record<StatusType, string> = {
  [StatusType.SCHEDULED]: "var(--status-scheduled)",
  [StatusType.COMPLETE]: "var(--status-complete)",
  [StatusType.ACTION_NEEDED]: "var(--status-action_needed)",
  [StatusType.UNDER_REVIEW]: "var(--status-under_review)",
  [StatusType.IN_PROGRESS]: "var(--status-in_progress)",
  [StatusType.UNASSESSED]: "var(--status-unassesed)",
};

export const STATUS_LABELS: Record<StatusType, string> = {
  [StatusType.SCHEDULED]: "SCHEDULED",
  [StatusType.COMPLETE]: "COMPLETE",
  [StatusType.ACTION_NEEDED]: "ACTION_NEEDED",
  [StatusType.UNDER_REVIEW]: "UNDER_REVIEW",
  [StatusType.IN_PROGRESS]: "IN_PROGRESS",
  [StatusType.UNASSESSED]: "UNASSESSED",
};

interface StatusData {
  type: StatusType;
  value: number;
}

export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  assessmentStatus: StatusType | TrackingStatusType;
  latestActivityId?: string;
  completedDate?: string;
  hasManualEntryTag?: boolean;
  sodaSubtestNames?: string[];
  latestAssignmentPeriodId?: string | null;
  isSodaReady?: boolean;
}

export interface DonutChartProps {
  data: StatusData[];
  completePercentage: number;
  handleChartButtonClick?: () => void;
}

// #endregion Declarations

export const RenderCustomLabelWithLine = ({ x, y, cx, cy, payload, outerRadius, value }: any) => {
  const { t } = useTranslation("dashboard");
  if (!x || !y || !outerRadius || value === 0) return null;

  const angle = Math.atan2(y - cy, x - cx);
  const lineStartX = cx + outerRadius * Math.cos(angle);
  const lineStartY = cy + outerRadius * Math.sin(angle);

  const adjustedEndRadius = outerRadius + 12;
  const lineEndX = cx + adjustedEndRadius * Math.cos(angle);
  const lineEndY = cy + adjustedEndRadius * Math.sin(angle);

  const dx = lineEndX > cx ? 15 : -45;

  // Format the label with count
  const statusLabel = t(STATUS_LABELS[payload?.type as StatusType]);
  const labelWithCount = `${value} ${statusLabel}`;

  return (
    <g style={{ pointerEvents: "none" }}>
      <line
        x1={lineStartX}
        y1={lineStartY}
        x2={lineEndX}
        y2={lineEndY}
        stroke="black"
        strokeWidth={1.5}
      />
      <foreignObject x={lineEndX + dx - 26} y={lineEndY - 12} width={120} height={24}>
        <div className="data-pill">
          <div className="data-pill-label">{labelWithCount}</div>
        </div>
      </foreignObject>
    </g>
  );
};

export const DonutChart = ({
  data,
  completePercentage,
  handleChartButtonClick
}: DonutChartProps) => {
  const [isSafari, setIsSafari] = useState(false);
  if (!data || data.length === 0) {
    return null;
  }
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  return (
    <div className="donut-chart-container" data-testid="donut-chart-container" onClick={handleChartButtonClick}>
      <div
        className="donut-chart-container-inner"
        style={{ position: "relative", height: isSafari ? "270px" : "100%" }}
      >
        <button type="button" className="chart-button-assessment-status" onClick={(e) =>{ e.stopPropagation(); handleChartButtonClick?.()}}>
          <img
            src={studentListIcon}
            className="chart-icon-assessment-status"
          />
        </button>
        <ResponsiveContainer width="100%" height="100%" className="donut-responsive-container">
          <PieChart>
            <defs>
              <pattern
                id="actionNeededStripes"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(-45)"
              >
                <rect width="6" height="6" fill="#FF595E" />
                <rect x="0" y="0" width="4" height="6" fill="#FF595E" />
                <rect x="4" y="0" width="1" height="6" fill="#F14668" />
              </pattern>
            </defs>
            <Pie
              data={data}
              dataKey="value"
              outerRadius="75%"
              innerRadius="43%"
              cx="50%"
              cy="50%"
              cornerRadius={3.5}
              paddingAngle={0.25}
              label={(props) => <RenderCustomLabelWithLine {...props} />}
              labelLine={false}
              isAnimationActive={false}
            >
              {data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === StatusType.ACTION_NEEDED ? "url(#actionNeededStripes)" : STATUS_COLORS[entry.type]}
                  onClick={handleChartButtonClick}
                  data-testid={`donut-chart-cell-${index}`}
                  style={{ cursor: "pointer" }}
                  className="no-focus-outline"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-chart-percentage-overlay-container d-flex align-items-end">
          <div className="donut-chart-percentage-overlay">
            {completePercentage}
            <span className="percentage-symbol">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
