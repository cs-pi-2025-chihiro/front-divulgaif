import { BookOpen, Tags } from "lucide-react";
import "./DashboardFilter.css";
import { useTranslation } from "react-i18next";

const DashboardFilter = ({ activeView, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-filter-container">
      <div className="filter-toggle-group">
        <button
          className={`filter-toggle-btn ${
            activeView === "authors" ? "active" : ""
          }`}
          onClick={() => onToggle("authors")}
        >
          {t("dashboard.toggles.authors")}
          {/* Fill added to match the solid look of the target image icons slightly better */}
          <BookOpen size={20} className="toggle-btn-icon" strokeWidth={1.5} />
        </button>
        <button
          className={`filter-toggle-btn ${
            activeView === "labels" ? "active" : ""
          }`}
          onClick={() => onToggle("labels")}
        >
          {t("dashboard.toggles.labels")}
          {/* Fill added to match the solid look of the target image icons slightly better */}
          <Tags
            size={20}
            className="toggle-btn-icon"
            strokeWidth={1.5}
            fill={activeView === "labels" ? "currentColor" : "#e2dfd7"}
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardFilter;
