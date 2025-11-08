import "./BarListItem.css";

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

export default BarListItem;
