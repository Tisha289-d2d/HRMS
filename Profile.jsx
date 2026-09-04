import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/loaders/loader";

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
  });


  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      let res = null;
      try {
        res = await API.get("/employees/me");
      } catch (err) {
        console.warn("No employee record yet or error fetching profile", err);
      }

      let holidaysRes = null;
      try {
        holidaysRes = await API.get("/holidays/upcoming", { params: { limit: 3 } });
      } catch (err) {
        console.warn("Failed to fetch upcoming holidays", err);
      }

      const emp = res?.data?.data || res?.data || null;
      setEmployee(emp);

      if (holidaysRes) {
        setUpcomingHolidays(holidaysRes.data?.data || holidaysRes.data || []);
      }

      if (emp) {
        setFormData({
          name: emp.user?.name || user?.name || "",
          email: emp.user?.email || user?.email || "",
          phone: emp.user?.phone || emp.phone || "",
          address: emp.user?.address || emp.address || "",
          gender: emp.gender || "",
          dob: emp.dob || "",
          bank_name: emp.bank_name || "",
          account_number: emp.account_number || "",
          ifsc_code: emp.ifsc_code || "",
          branch_name: emp.branch_name || "",
        });
      } else {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          address: "",
          gender: "",
          dob: "",
          bank_name: "",
          account_number: "",
          ifsc_code: "",
          branch_name: "",
        });
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        gender: "",
        dob: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/employees/me", formData);
      toast.success("Profile updated successfully!");
      
      const emp = res.data.data || res.data;
      if (emp) {
        setEmployee(emp);
        setFormData({
          name: emp.user?.name || user?.name || "",
          email: emp.user?.email || user?.email || "",
          phone: emp.user?.phone || emp.phone || "",
          address: emp.user?.address || emp.address || "",
          gender: emp.gender || "",
          dob: emp.dob || "",
          bank_name: emp.bank_name || "",
          account_number: emp.account_number || "",
          ifsc_code: emp.ifsc_code || "",
          branch_name: emp.branch_name || "",
        });
        
        const updatedUser = { 
          ...user, 
          name: emp.user?.name || formData.name, 
          email: emp.user?.email || formData.email 
        };
        login(updatedUser, localStorage.getItem("token"));
      }
    } catch (err) {
      console.error("Update Error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div className="hrms-card" style={{ padding: '32px', textAlign: 'center', height: 'fit-content' }}>
              <div style={{ 
                  width: '120px', height: '120px', 
                  borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), #e0e7ff)', 
                  color: 'var(--primary)', fontSize: '42px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '4px solid white'
              }}>
                  {formData.name?.charAt(0) || 'U'}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>{formData.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                {employee?.designation || user?.role?.toUpperCase()} · Active
              </p>
          </div>

          <div className="hrms-card">
              <div className="card-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span> Upcoming Holidays
                </h2>
              </div>
              <div className="card-body" style={{ padding: '0 20px' }}>
                {upcomingHolidays.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {upcomingHolidays.map((h) => (
                      <li key={h.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)", display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '24px', background: 'var(--bg-main)', minWidth: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                          🎉
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>{h.title}</strong>
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            {new Date(h.holiday_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div>
                          <span className={`badge badge-${h.type === 'public' ? 'info' : (h.type === 'festival' ? 'success' : 'purple')}`} style={{ textTransform: 'capitalize' }}>
                            {h.type}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No upcoming holidays found.</p>
                  </div>
                )}
              </div>
          </div>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>Personal Details</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    name="name"
                    className="form-control" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    name="email"
                    className="form-control" 
                    value={formData.email} 
                    disabled 
                    style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }}
                  />
                </div>
            </div>
            
            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    name="phone"
                    className="form-control" 
                    placeholder="+1 234..." 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Address</label>
                  <input 
                    name="address"
                    className="form-control" 
                    placeholder="New York, USA" 
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date"
                    name="dob"
                    className="form-control" 
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '32px 0 24px' }} />
            
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)' }}>Bank Account Details</h3>
            
            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input 
                    name="bank_name"
                    className="form-control" 
                    placeholder="e.g. State Bank of India" 
                    value={formData.bank_name} 
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input 
                    name="account_number"
                    className="form-control" 
                    placeholder="e.g. 1234567890" 
                    value={formData.account_number}
                    onChange={handleChange}
                  />
                </div>
            </div>
            
            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">IFSC Code / Routing Number</label>
                  <input 
                    name="ifsc_code"
                    className="form-control" 
                    placeholder="e.g. SBIN0001234" 
                    value={formData.ifsc_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch Name</label>
                  <input 
                    name="branch_name"
                    className="form-control" 
                    placeholder="e.g. Main Branch" 
                    value={formData.branch_name}
                    onChange={handleChange}
                  />
                </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ minWidth: '180px', justifyContent: 'center' }} disabled={saving}>
                    {saving ? "Saving Changes..." : "Save Changes"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;