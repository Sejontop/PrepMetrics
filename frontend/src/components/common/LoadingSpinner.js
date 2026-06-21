export default function LoadingSpinner({ size = 36 }) {
  return (
    <div className="page-loader">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}
