const AmenityBadge = ({ label }) => {
  return (
    <span style={{
      padding: "5px 10px",
      background: "#eee",
      borderRadius: "10px",
      margin: "3px",
      display: "inline-block"
    }}>
      {label}
    </span>
  );
};

export default AmenityBadge;