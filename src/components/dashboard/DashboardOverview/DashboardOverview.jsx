import { useTranslation } from "react-i18next";
import StatCard from "../StatCard";
import BarListCard from "../BarListCard";
import "./DashboardOverview.css";

const DashboardOverview = ({
  totalWorksByStatus,
  totalPublishedWorksByLabel,
  totalPublishedWorksByAuthor,
}) => {
  const { t } = useTranslation();

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
    .map((item) => ({ name: item.label, value: item.total }))
    .slice(0, 5);

  const authorsData = totalPublishedWorksByAuthor
    .map((item) => ({ name: item.author, value: item.total }))
    .slice(0, 5);

  return (
    <div className="dashboard-overview">
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

export default DashboardOverview;
