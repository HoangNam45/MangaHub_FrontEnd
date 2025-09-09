'use client';
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Shimmer animation */}
        <style jsx>{`
          .shimmer {
            position: relative;
            overflow: hidden;
            background-color: #e5e7eb;
          }
          .shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            height: 100%;
            width: 150%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            100% {
              left: 150%;
            }
          }
        `}</style>

        {/* Title */}
        <div className="shimmer h-6 w-3/4 rounded-md" />

        {/* Image */}
        <div className="shimmer h-52 w-full rounded-2xl" />

        {/* Text lines */}
        <div className="space-y-3">
          <div className="shimmer h-4 w-full rounded" />
          <div className="shimmer h-4 w-5/6 rounded" />
          <div className="shimmer h-4 w-2/3 rounded" />
        </div>

        {/* Button */}
        <div className="shimmer h-10 w-1/3 rounded-xl" />
      </div>
    </div>
  );
}
