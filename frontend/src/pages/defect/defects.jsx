import { useEffect, useState } from "react";
import DefectList from "../../components/defect/defectlist";
import { getDefects } from "../../services/defect.service";

const DefectsPage = () => {
  const [defects, setDefects] = useState([]);

  useEffect(() => {
    fetchDefects();
  }, []);

  const fetchDefects = async () => {
    const res = await getDefects();
    setDefects(res.data);
  };

  return (
    <div>
      <h2>Reported Defects</h2>
      <DefectList defects={defects} />
    </div>
  );
};

export default DefectsPage;