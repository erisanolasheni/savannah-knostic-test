const inputClass = 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2';

export interface StoreFormData {
  name: string;
  location: string;
}

interface StoreFormProps {
  data: StoreFormData;
  onChange: (data: StoreFormData) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function StoreForm({
  data,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
}: StoreFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className={inputClass}
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          className={inputClass}
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          required
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
