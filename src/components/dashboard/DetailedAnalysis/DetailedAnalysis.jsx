import { useTranslation } from "react-i18next";
import StatCard from "../StatCard";
import BarListCard from "../BarListCard";
import DashboardFilter from "../DashboardFilter/DashboardFilter";
import "./DetailedAnalysis.css";

const DetailedAnalysis = ({
  activeDetailView,
  onToggleDetailView,
  isDetailedLoading,
  detailedStats,
  detailedList,
}) => {
  const { t } = useTranslation();

  return (
    <div className="detailed-analysis">
      <div className="dashboard-expanded-section">
        <h2 className="expanded-section-title">
          {t("dashboard.detailedAnalysis")}
        </h2>

        <div className="detailed-stats-grid">
          <DashboardFilter
            activeView={activeDetailView}
            onToggle={onToggleDetailView}
          />
          {isDetailedLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-loading-text">
                {activeDetailView === "authors"
                  ? t("dashboard.loadingAuthors")
                  : t("dashboard.loadingLabels")}
              </div>
            </div>
          ) : activeDetailView === "authors" ? (
            <>
              <StatCard
                status={t("dashboard.stats.internos")}
                total={detailedStats?.internalAuthorsCount || 0}
                icon="Users"
              />
              <StatCard
                status={t("dashboard.stats.externos")}
                total={detailedStats?.externalAuthorsCount || 0}
                icon="Globe"
              />
              <StatCard
                status={t("dashboard.stats.mostCited")}
                total={detailedStats?.mostCitedAuthor || "-"}
                icon="Trophy"
              />
            </>
          ) : (
            <>
              <StatCard
                status={t("dashboard.stats.quantityOfLabels")}
                total={detailedStats?.quantityOfLabels || 0}
                icon="Tag"
              />
              <StatCard
                status={t("dashboard.stats.mostUsedLabel")}
                total={detailedStats?.mostUsedLabel || "-"}
                icon="TrendingUp"
              />
              <StatCard
                status={t("dashboard.stats.leastUsedLabel")}
                total={detailedStats?.leastUsedLabel || "-"}
                icon="TrendingDown"
              />
            </>
          )}
        </div>

        <div className="detailed-chart-container">
          {isDetailedLoading ? (
            <div className="dashboard-loading">
              <div className="dashboard-loading-text">
                {activeDetailView === "authors"
                  ? t("dashboard.loadingAuthors")
                  : t("dashboard.loadingLabels")}
              </div>
            </div>
          ) : detailedList && detailedList.length > 0 ? (
            <BarListCard
              title={
                activeDetailView === "authors"
                  ? t("dashboard.charts.detailedAuthors")
                  : t("dashboard.charts.detailedLabels")
              }
              data={detailedList.map((item) => ({
                name:
                  activeDetailView === "authors"
                    ? item.author || item.name
                    : item.label || item.name,
                value: item.total || item.value || item.count || 0,
              }))}
              isAuthor={activeDetailView === "authors"}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;
