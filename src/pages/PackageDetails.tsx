import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../data/mnm_database.json';

const PackageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pkg = db.packages.find(p => p.id.toString() === id);

  if (!pkg) {
    return (
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#050B14', color: '#ffffff', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Package Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>The travel package you are looking for does not exist.</p>
        <Link to="/packages" style={{ padding: '0.75rem 2rem', backgroundColor: '#D97736', color: 'white', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>
          Browse All Packages
        </Link>
      </div>
    );
  }

  const imageUrl = pkg.image_url || pkg.image || pkg.img;
  const nights = pkg.nights || pkg.duration || pkg.days;
  const location = pkg.location || pkg.locations || pkg.highlights;

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#050B14', color: '#ffffff', position: 'relative', zIndex: 10, paddingBottom: '6rem' }}>
      {/* Physical Spacer for Nav */}
      <div style={{ height: '140px', width: '100%' }}></div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.75rem 1.5rem', borderRadius: '9999px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', transition: 'all 0.3s ease' }}
        >
          ← Back to Destinations
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div style={{ width: '100%', height: '60vh', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <img src={imageUrl} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '40px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '1.5rem', width: 'fit-content' }}>{nights}</div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>{pkg.title}</h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>📍 {location}</p>
            <div style={{ marginTop: 'auto' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starting Price</p>
              <div style={{ fontSize: '3rem', color: '#D97736', fontWeight: '900', marginBottom: '2rem' }}>{pkg.price}</div>
              <button style={{ width: '100%', padding: '1.25rem', backgroundColor: '#D97736', color: 'white', borderRadius: '9999px', fontWeight: '800', fontSize: '1.25rem', cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px -5px rgba(217, 119, 54, 0.4)', transition: 'transform 0.2s ease, filter 0.2s ease' }}>
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;