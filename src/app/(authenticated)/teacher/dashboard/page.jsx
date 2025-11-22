import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "./useDashboard";
import "./page.css";
import DashboardOverview from "../../../../components/dashboard/DashboardOverview";
import DetailedAnalysis from "../../../../components/dashboard/DetailedAnalysis";

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeDetailView, setActiveDetailView] = useState("labels");

  const dashboardHook = useDashboard(activeDetailView);

  const {
    isLoading,
    error,
    totalWorksByStatus,
    totalPublishedWorksByLabel,
    totalPublishedWorksByAuthor,
  } = dashboardHook;

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
      <DashboardOverview
        totalWorksByStatus={totalWorksByStatus}
        totalPublishedWorksByLabel={totalPublishedWorksByLabel}
        totalPublishedWorksByAuthor={totalPublishedWorksByAuthor}
      />

      <DetailedAnalysis
        activeDetailView={activeDetailView}
        onToggleDetailView={setActiveDetailView}
        dashboardHook={dashboardHook}
      />
    </div>
  );
};

export default Dashboard;
