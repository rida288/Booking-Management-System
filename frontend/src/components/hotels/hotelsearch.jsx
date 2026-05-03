import { useState } from "react";

const HotelSearch = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => onSearch(query);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={styles.wrap}>
      <input
        style={styles.input}
        type="text"
        placeholder="Search by name, city, or country..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button style={styles.btn} onClick={handleSearch}>Search</button>
    </div>
  );
};

const styles = {
  wrap: { display:'flex', gap:'10px', maxWidth:'500px' },
  input: { flex:1, padding:'10px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', outline:'none' },
  btn: { padding:'10px 20px', background:'#1a1a2e', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }
};

export default HotelSearch;