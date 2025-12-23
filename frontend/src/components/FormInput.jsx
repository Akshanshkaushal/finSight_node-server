export function FormInput({ label, type = 'text', value, onChange, placeholder, ...rest }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...rest}
      />
    </label>
  );
}

