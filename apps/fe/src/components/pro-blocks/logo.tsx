interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 117.211 375 140.566"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Moccilabs"
    >
      <path
        fill="currentColor"
        d="M 187.496094 117.210938 L 93.789062 117.210938 L 93.789062 164.070312 L 140.644531 210.921875 L 140.644531 257.777344 L 234.355469 257.777344 L 234.355469 164.070312 L 187.496094 164.070312 Z M 187.496094 117.210938"
      />
      <path
        fill="currentColor"
        d="M 0.078125 164.070312 L 0.078125 257.777344 L 93.789062 257.777344 L 93.789062 164.070312 Z M 0.078125 164.070312"
      />
      <path
        fill="currentColor"
        d="M 328.0625 164.070312 L 328.0625 117.210938 L 234.355469 117.210938 L 234.355469 164.070312 L 281.210938 210.921875 L 281.210938 257.777344 L 374.921875 257.777344 L 374.921875 164.070312 L 328.0625 164.070312 Z M 328.0625 164.070312"
      />
    </svg>
  );
};
