import React from "react";

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center gap-4 justify-center mt-4">
      
      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={handlePrev}>
        Prev
      </button>

      <span className="font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={handleNext}>
        Next
      </button>

    </div>
  );
}

export default Pagination;