import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "./useDashboard";
import "./page.css";
import DashboardOverview from "../../../../components/dashboard/DashboardOverview";
import DetailedAnalysis from "../../../../components/dashboard/DetailedAnalysis";
import AuthorsManagement from "./authors/page"; // ⬅️ ADICIONE ESTE IMPORT

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeDetailView, setActiveDetailView] = useState("labels");

  const {
    isLoading,
    error,
    totalWorksByStatus,
    totalPublishedWorksByLabel,
    totalPublishedWorksByAuthor,
    isDetailedLoading,
    detailedStats,
    detailedList,
  } = useDashboard(activeDetailView);

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
        isDetailedLoading={isDetailedLoading}
        detailedStats={detailedStats}
        detailedList={detailedList}
      />

      {/* ⬇️ ADICIONE ESTA SEÇÃO DE AUTORES */}
      {activeDetailView === "authors" && (
        <div className="dashboard-authors-section">
          <AuthorsManagement />
        </div>
      )}
    </div>
  );
};

export default Dashboard;