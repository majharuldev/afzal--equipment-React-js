import { Controller, useFormContext } from "react-hook-form";
import Select from "react-select";

export const InputField = ({
  name,
  label,
  type,
  value,
  placeholder = "",
  defaultValue,
  required = false,
  inputRef,
  icon,
  readOnly = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;
  const { ref, ...rest } = register(name, {
    required: required ? `${label || name} is required` : false,
  });

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-primary"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          type={type}
          placeholder={placeholder || `Enter ${label || name}`}
          defaultValue={defaultValue}
          value={value}
          readOnly={readOnly}
          {...rest}
          ref={(el) => {
            ref(el);
            if (inputRef) inputRef(el);
          }}
          className={`remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded outline-none ${
            icon ? "pr-10" : ""
          } ${readOnly ? "bg-gray-200" : "bg-white"}`}
        />
        {icon && icon}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// export const SelectField = ({
//   name,
//   label,
//   required,
//   options,
//   control,
//   placeholder,
//   defaultValue,
//   onSelectChange,
// }) => {
//   const {
//     formState: { errors },
//   } = useFormContext();

//   const error = errors[name]?.message;

//   return (
//     <div className="mb-4">
//       {label && (
//         <label className="block text-sm font-medium mb-1 text-primary">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
//       <Controller
//         name={name}
//         control={control}
//         rules={{ required: required ? `${label || name} is required` : false }}
//         render={({ field: { onChange, value, ref } }) => (
//           <Select
//             inputRef={ref}
//             value={options.find((opt) => opt.value === value) || null}
//             onChange={(selectedOption) => {
//               const selectedValue = selectedOption?.value || "";
//               onChange(selectedValue);
//               if (onSelectChange) {
//                 onSelectChange(selectedOption);
//               }
//             }}
//             options={options}
//             placeholder={placeholder || `Select ${label}`}
//             defaultValue={defaultValue}
//             className="text-sm hide-scrollbar"
//             classNamePrefix="react-select"
//             isClearable
//           />
//         )}
//       />
//       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
//   );
// };


import CreatableSelect from "react-select/creatable";

export const SelectField = ({
  name,
  label,
  required,
  options,
  control,
  placeholder,
  defaultValue,
  onSelectChange,
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label || name} is required` : false }}
        render={({ field: { onChange, value, ref } }) => (
          <CreatableSelect
            inputRef={ref}
            value={
              options.find((opt) => opt.value === value) || { label: value, value }
            }
            onChange={(selectedOption) => {
              const selectedValue = selectedOption?.value || "";
              onChange(selectedValue);
              if (onSelectChange) {
                onSelectChange(selectedOption);
              }
            }}
            options={options}
            placeholder={placeholder || `Select ${label}`}
            defaultValue={defaultValue}
            className="text-sm hide-scrollbar"
            classNamePrefix="react-select"
            isClearable
          />
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
