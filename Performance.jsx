import { useEffect, useState } from "react";
import API from "../../api/api";
import Loader from "../../components/loaders/Loader";

function Performance() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPerformance();
  }, []);

  const fetchMyPerformance = async () => {
    try {
      const res = await API.get("/performances/me");
      const allReviews = res.data.data || res.data || [];
      setReviews(Array.isArray(allReviews) ? allReviews : []);
    } catch (err) {
      console.error("Failed to fetch performance reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? "#f59e0b" : "#d1d5db",
            fontSize: "18px",
          }}
        >
          ★
        </span>
      ));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Performance Reviews</h1>
          <p>View your professional growth and feedback from management</p>
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>Review History</h2>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rating</th>
                  <th>Feedback & Details</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <tr key={rev.id}>
                      <td style={{ width: '150px' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ width: '150px' }}>
                        {renderStars(rev.rating)}
                      </td>
                      <td>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                          {rev.review || "No detailed feedback provided."}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-state">
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                      <h3>No reviews yet</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Performance;
