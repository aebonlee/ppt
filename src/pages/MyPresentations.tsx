import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadPresentations, deletePresentation, loadPresentation } from '../services/aiService';
import '../styles/my-presentations.css';

interface PresentationSummary {
  id: string;
  title: string;
  description: string;
  orientation: string;
  color_scheme_id: string;
  slide_count: number;
  created_at: string;
  updated_at: string;
}

const MyPresentations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPresentations()
      .then(data => setPresentations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deletePresentation(id);
      setPresentations(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async (id: string) => {
    try {
      const pres = await loadPresentation(id);
      const url = `/preview?data=${encodeURIComponent(JSON.stringify(pres))}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1 className="page-title">내 프레젠테이션</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p>로딩 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">내 프레젠테이션</h1>
          <p className="page-description">생성한 프레젠테이션을 관리합니다</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px' }}>
        {presentations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>아직 생성한 프레젠테이션이 없습니다</h3>
            <p>AI를 사용하여 첫 프레젠테이션을 만들어 보세요!</p>
            <button className="btn btn-primary" onClick={() => navigate('/generate')}>
              PPT 생성하기
            </button>
          </div>
        ) : (
          <div className="presentations-grid">
            {presentations.map(pres => (
              <div key={pres.id} className="presentation-card">
                <div className="pres-card-header">
                  <div className="pres-orientation">{pres.orientation === 'portrait' ? '세로' : '가로'}</div>
                  <div className="pres-slide-count">{pres.slide_count}장</div>
                </div>
                <h3 className="pres-title">{pres.title}</h3>
                {pres.description && <p className="pres-desc">{pres.description}</p>}
                <div className="pres-date">{new Date(pres.created_at).toLocaleDateString('ko-KR')}</div>
                <div className="pres-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => handleOpen(pres.id)}>열기</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(pres.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPresentations;
