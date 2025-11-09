import {
  CheckCheck,
  Clock,
  RefreshCw,
  Users,
  Globe,
  Trophy,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import "./StatCard.css";

export const iconMap = {
  CheckCheck: (props) => <CheckCheck {...props} />,
  RefreshCw: (props) => <RefreshCw {...props} />,
  Clock: (props) => <Clock {...props} />,
  Users: (props) => <Users {...props} />,
  Globe: (props) => <Globe {...props} />,
  Trophy: (props) => <Trophy {...props} />,
  Tag: (props) => <Tag {...props} />,
  TrendingUp: (props) => <TrendingUp {...props} />,
  TrendingDown: (props) => <TrendingDown {...props} />,
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

export default StatCard;
