import { useDashboard } from "./useDashboard";
import "./page.css";
import { CheckCheck, Clock, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { navigateTo } from "../../../../services/utils/utils";

export const iconMap = {
  CheckCheck: (props) => <CheckCheck {...props} />,
  RefreshCw: (props) => <RefreshCw {...props} />,
  Clock: (props) => <Clock {...props} />,
};

const StatCard = ({ status, total, icon }) => {
  const IconComponent = iconMap[icon] || CheckCheck;

  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <IconComponent />
      </div>
      <div className="stat-card-content">
        <div className="stat-card-status">{status}</div>
        <div className="stat-card-total">{total}</div>
      </div>
    </div>
  );
};

const BarListItem = ({ name, value, maxValue, isAuthor = false }) => {
  const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;

  let displayName;
  if (isAuthor) {
    displayName = name.split(" ")[0];
  } else {
    displayName = name.length > 40 ? `${name.substring(0, 40)}...` : name;
  }

  return (
    <div className="bar-list-item">
      <span className="bar-list-name" title={name}>
        {displayName}
      </span>
      <div className="bar-list-bar-container">
        <div className="bar-list-bar" style={{ width: `${barWidth}%` }}></div>
      </div>
      <span className="bar-list-value">{value}</span>
    </div>
  );
};

const BarListCard = ({ title, data, isAuthor = false }) => {
  const maxValue =
    data.length > 0 ? Math.max(...data.map((item) => item.value)) : 1;

  return (
    <div className="bar-list-card">
      <div className="bar-list-card-content">
        <h3 className="bar-list-card-title">{title}</h3>
        <div className="bar-list-container">
          {data.map((item, index) => (
            <BarListItem
              key={`${item.name}-${index}`}
              name={item.name}
              value={item.value}
              maxValue={maxValue}
              isAuthor={isAuthor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const {
    isLoading,
    error,
    refetch,
    totalWorksByStatus,
    totalPublishedWorksByLabel,
    totalPublishedWorksByAuthor,
  } = useDashboard();

  // Handle 403 errors by redirecting to 404 page
  useEffect(() => {
    if (error && error.status === 403) {
      navigateTo("404", navigate, currentLang);
    }
  }, [error, navigate, currentLang]);

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
