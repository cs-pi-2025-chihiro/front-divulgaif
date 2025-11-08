import { useDashboard } from "./useDashboard";
import "./page.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { navigateTo } from "../../../../services/utils/utils";
import StatCard from "../../../../components/dashboard/StatCard";
import BarListCard from "../../../../components/dashboard/BarListCard";

const Dashboard = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    error,
    refetch,
    totalWorksByStatus,
    totalPublishedWorksByLabel,
    totalPublishedWorksByAuthor,
  } = useDashboard();

  const getTotalForStatus = (status) => {
    return (
      totalWorksByStatus.find((item) => item.status === status)?.total || 0
    );
  };

  const statsData = [
    {
      status: t("dashboard.status.published"),
      total: getTotalForStatus("PUBLISHED"),
      icon: "CheckCheck",
    },
    {
      status: t("dashboard.status.pendingChanges"),
      total: getTotalForStatus("PENDING_CHANGES"),
      icon: "RefreshCw",
    },
    {
      status: t("dashboard.status.submitted"),
      total: getTotalForStatus("SUBMITTED"),
      icon: "Clock",
    },
  ];

  const labelsData = totalPublishedWorksByLabel
    .map((item) => ({
      name: item.label,
      value: item.total,
    }))
    .slice(0, 5);

  const authorsData = totalPublishedWorksByAuthor
    .map((item) => ({
      name: item.author,
      value: item.total,
    }))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-text">{t("dashboard.loading")}</div>
      </div>
    );
  }

  if (error && error.status !== 403) {
    return (
      <div className="dashboard-error">
        <div className="dashboard-error-content">
          <div>
            {t("dashboard.error")} {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="stats-column">
          {statsData.map((stat) => (
            <StatCard
              key={stat.status}
              status={stat.status}
              total={stat.total}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="chart-column">
          <BarListCard
            title={t("dashboard.charts.frequentLabels")}
            data={labelsData}
          />
        </div>

        <div className="chart-column">
          <BarListCard
            title={t("dashboard.charts.mostWorks")}
            data={authorsData}
            isAuthor={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
