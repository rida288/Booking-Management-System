import { useState } from "react";
import { reportDefect } from "../../services/defect.service";

const DefectForm = ({ roomId, onSuccess }) => {
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    await reportDefect({ roomId, description });
    setDescription("");
    onSuccess();
  };

  return (
    <div>
      <textarea
        placeholder="Describe issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleSubmit}>Report</button>
    </div>
  );
};

export default DefectForm;