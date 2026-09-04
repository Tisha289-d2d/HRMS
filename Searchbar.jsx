import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";

function SearchBar({ search, setSearch }) {
  return (
    <div className="searchbar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;