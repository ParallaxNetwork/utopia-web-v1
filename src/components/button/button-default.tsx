type ButtonDefaultProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function ButtonDefault({ ...props }: ButtonDefaultProps) {
  return (
    <button
      className={`bg-transparent border border-white text-white font-semibold py-1 px-4 rounded-full transition hover:bg-utopia-green hover:text-black focus:bg-utopia-green focus:text-black ${props.className}`}
      onClick={props.onClick}>
      {props.children}
    </button>
  );
}
