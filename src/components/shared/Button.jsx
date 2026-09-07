export default function Button({ children, className = '', ...props }) {
  return <button className={`primary ${className}`.trim()} {...props}>{children}</button>;
}
