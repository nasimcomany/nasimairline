import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DisabledRoute Component
 * این کامپوننت route های غیرفعال شده رو به صفحه اصلی redirect می‌کنه
 * برای امنیت بیشتر، هیچ محتوایی render نمی‌کنه و فوراً redirect می‌کنه
 */
const DisabledRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // فوراً به صفحه اصلی redirect کن
    navigate('/', { replace: true });
  }, [navigate]);

  // هیچی render نکن - برای امنیت
  return null;
};

export default DisabledRoute;
