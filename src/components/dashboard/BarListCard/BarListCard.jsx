import BarListItem from "../BarListItem";
import "./BarListCard.css";

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

export default BarListCard;
