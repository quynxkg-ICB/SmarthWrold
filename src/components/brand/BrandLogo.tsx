import React from 'react';
import contentData from '../../data/contentData.json';

interface BrandLogoProps {
  variant?: 'full-color' | 'white' | 'solid-white' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full-color',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isWhite = variant === 'white' || variant === 'solid-white';
  const isIconOnly = variant === 'icon-only';

  // Height sizing for the authentic logo image (maintains exact aspect ratio of 2363x895)
  const sizeClasses = {
    sm: 'h-8 max-w-[140px]',
    md: 'h-11 max-w-[190px]',
    lg: 'h-14 max-w-[240px]',
    xl: 'h-20 max-w-[320px]',
  };

  const iconSizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Safe area 2X according to the official Brand Guidelines PDF
  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ padding: '2px' }}
      title={`${contentData.appInfo.name} - ${contentData.appInfo.branch}`}
    >
      {isIconOnly ? (
        <img
          src={isWhite ? contentData.mediaAssets.coinIconWhite : contentData.mediaAssets.coinIcon}
          alt="VietinBank Emblem"
          className={`${iconSizeClasses[size]} object-contain drop-shadow-xs`}
        />
      ) : (
        <img
          src={
            variant === 'solid-white'
              ? contentData.mediaAssets.branchLogoSolidWhite
              : variant === 'white'
              ? contentData.mediaAssets.branchLogoWhite
              : contentData.mediaAssets.branchLogo
          }
          alt="VietinBank Chi Nhánh Kiên Giang"
          className={`${sizeClasses[size]} w-auto object-contain transition-all duration-200 drop-shadow-2xs`}
        />
      )}
    </div>
  );
};

export default BrandLogo;
