import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  onClick?: () => void;
}

const USE_IMAGE_LOGO = true;
const LOGO_SRC = '/logo.png';

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  className = '',
  showSubtitle = false,
  size = 'md',
  to = '/',
  onClick
}) => {
  const sizeStyles = {
    sm: { height: '34px', width: '34px', fontSize: '1.1rem' },
    md: { height: '42px', width: '42px', fontSize: '1.3rem' },
    lg: { height: '56px', width: '56px', fontSize: '1.6rem' }
  }[size];

  const content = (
    <div className={`logo-container ${variant} ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
      {USE_IMAGE_LOGO ? (
        <img
          src={LOGO_SRC}
          alt="JURO Brand Logo"
          style={{
            height: sizeStyles.height,
            width: sizeStyles.width,
            objectFit: 'cover',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'block'
          }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          className="logo-text"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: sizeStyles.fontSize,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#FFFFFF'
          }}
        >
          JURO
        </span>
        {showSubtitle && (
          <span
            className="logo-sub"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.35em',
              color: '#737373',
              marginTop: '2px',
              textTransform: 'uppercase'
            }}
          >
            STUDIO
          </span>
        )}
      </div>
    </div>
  );

  if (!to) {
    return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>{content}</div>;
  }

  return (
    <Link to={to} onClick={onClick} style={{ display: 'inline-flex', textDecoration: 'none' }}>
      {content}
    </Link>
  );
};

export default Logo;
