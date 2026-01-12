interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function StarRating({ 
  rating, 
  reviewCount, 
  size = 'md', 
  showCount = true,
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={`${sizeClasses[size]} text-yellow-400 drop-shadow-sm`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <svg
              className={`${sizeClasses[size]} text-gray-300`}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg
              className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0 drop-shadow-sm`}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-gray-300`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Rating Text */}
      <span className={`ml-2 font-semibold text-gray-900 ${textSizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>

      {/* Review Count */}
      {showCount && reviewCount !== undefined && (
        <span className={`ml-1 text-indigo-200 ${textSizeClasses[size]}`}>
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
