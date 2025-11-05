import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Arrow, LoadingFailure } from "@components/global/icons";
import { graphQLClient } from "@services";
import { useSelectedClassroom } from "@hooks";
import "./IndividualLearningPath.scss";
import calendarIcon from "/images/icons/calendar-day.svg";

interface UsageData {
  startDate: string;
  endDate: string;
  usageForProducts: Array<any>;
}

interface UsageStatusItem {
  status: string;
  count: number;
  percent: number;
}

const query = `
query GetUsageData {
  usageData(input: {
    dateInterval: WEEK,
    products: [READING],
    leaUserRole: TEACHER
  }) {
    startDate
    endDate
    usageForProducts {
      productValue
      usageStatusPercentages {
        status
        count
        percent
      }
    }
  }
}
  `;

export function IndividualLearningPath() {
  const [data, setData] = useState<UsageData | null>(null);
  const [under, setUnder] = useState<number>(0);
  const [onTrack, setOnTrack] = useState<number>(0);
  const [metGoal, setMetGoal] = useState<number>(0);
  const { classroomId } = useSelectedClassroom();
  const [error, setError] = useState(false);
  const { t } = useTranslation(["dashboard", "teacher_parent_report"]);

  const grabIstationUsageData = async () => {
    try {
      const endpoint = process.env.ISTATION_USAGE_API_URL || "/graphql";
      graphQLClient.setEndpoint(endpoint);
      const response = await graphQLClient.query(query);
      if (response.errors) {
        console.error("GraphQL Errors:", response.errors);
        setError(true);
      }
      setData(response.data?.usageData || null);
    } catch (error) {
      console.error("Error making GraphQL request:", error);
      setError(true);
    }
  };

  useEffect(() => {
    grabIstationUsageData();
  }, []);

  useEffect(() => {
    if (data) {
      const underData = data.usageForProducts[0].usageStatusPercentages.find(
        (item: UsageStatusItem) => item.status === "UNDER"
      );
      setUnder(underData?.count.toString() || "0");

      const activeData = data.usageForProducts[0].usageStatusPercentages.find(
        (item: UsageStatusItem) => item.status === "ACTIVE"
      );
      setOnTrack(activeData?.count.toString() || "0");

      const metGoalData = data.usageForProducts[0].usageStatusPercentages.find(
        (item: UsageStatusItem) => item.status === "MET_GOAL"
      );
      setMetGoal(metGoalData?.count.toString() || "0");
    }
  }, [data]);

  const onReload = () => {
    grabIstationUsageData();
  };

  return (
    <>
      {error ? (
        <LoadingFailure onReload={onReload} />
      ) : (
        <>
          <div className="usage-goals-bg">
            <div className="usage-goals-content">
              <div className="usage-goals-header">
                <h5>{t("WIDGET_TITLE_STUDENT_USAGE")}</h5>
                <div className="date-container">
                  <img src={calendarIcon} />
                  <span>
                    {moment.utc(data?.startDate).format("M/D")} -{" "}
                    {moment.utc(data?.endDate).format("M/D")}
                  </span>
                </div>
              </div>

              <div className="goals-stats-container">
                <div className="outer-number-container">
                  <div className="number-container">
                    <h1>{under ? under : ""}</h1>
                    <div className="red-dot" />
                  </div>
                  <span>{t("UNDER")}</span>
                </div>
                <div className="outer-number-container">
                  <div className="number-container">
                    <h1>{onTrack ? onTrack : ""}</h1>
                    <div className="blue-dot" />
                  </div>
                  <span>
                    {t("AT_GRADE_LEVEL", { ns: "teacher_parent_report" })}
                  </span>
                </div>
                <div className="outer-number-container">
                  <div className="number-container">
                    <h1>{metGoal ? metGoal : ""}</h1>
                    <div className="green-dot" />
                  </div>
                  <span>{t("MET_GOAL")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex w-100 justify-content-end">
            <NavLink
              className="btn btn-link"
              to={`${process.env.ISTATION_PROGRESS_REPORT_URL}${classroomId}`}
            >
              <span>{t("WIDGET_TO_LEARNING_PATH")}</span>
              <i className="icon"><Arrow /></i>
            </NavLink>
          </div>
        </>
      )}
    </>
  );
}