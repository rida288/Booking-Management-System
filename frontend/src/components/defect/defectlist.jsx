const DefectList = ({ defects }) => {
  return (
    <div>
      <h3>Defects</h3>
      {defects.map((d) => (
        <div key={d.id}>
          <p>{d.description}</p>
          <small>Status: {d.status}</small>
        </div>
      ))}
    </div>
  );
};

export default DefectList;