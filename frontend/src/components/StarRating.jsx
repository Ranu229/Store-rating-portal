import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  onRatingChange = null,
  readOnly = false,
  size = 'md',
  showScore = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const currentDisplay = hoverRating || rating || 0;

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = currentDisplay >= star;
          const isHalf = !isFilled && currentDisplay >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`transition-transform p-0.5 ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 focus:outline-none'
              }`}
              title={readOnly ? `${rating} stars` : `Rate ${star} - ${labels[star]}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {rating > 0 ? Number(rating).toFixed(1) : 'No ratings'}
        </span>
      )}

      {!readOnly && hoverRating > 0 && (
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1 animate-fade-in">
          {labels[hoverRating]}
        </span>
      )}
    </div>
  );
};

export default StarRating;
